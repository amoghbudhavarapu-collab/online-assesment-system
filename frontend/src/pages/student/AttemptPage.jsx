import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAuth } from '../../auth/AuthProvider';
import { getAttempt, saveAnswer, submitAttempt } from '../../lib/api/attempts';
import { getErrorMessage } from '../../utils/errors';
import CountdownTimer from '../../components/examination/CountdownTimer';
import QuestionNavigation from '../../components/examination/QuestionNavigation';
import QuestionCard from '../../components/examination/QuestionCard';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import { Button } from '../../components/forms/Field';

export default function AttemptPage() {
  const { attemptId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [saveState, setSaveState] = useState('saved');
  const [confirm, setConfirm] = useState(false);
  const [expiredHandled, setExpiredHandled] = useState(false);
  const retryRef = useRef({});

  const query = useQuery({
    queryKey: ['attempt', attemptId],
    queryFn: () => getAttempt(attemptId),
    refetchOnWindowFocus: false
  });

  useEffect(() => {
    if (!query.data?.questions) return;
    const map = {};
    query.data.questions.forEach((q) => {
      map[q.questionId] = {
        selectedAnswer: q.selectedAnswer,
        isMarkedForReview: q.isMarkedForReview,
        isAnswered: q.isAnswered
      };
    });
    setAnswers(map);
  }, [query.data]);

  const persist = useCallback(
    async (questionId, payload) => {
      setSaveState('saving');
      try {
        await saveAnswer(attemptId, questionId, payload);
        setSaveState('saved');
        delete retryRef.current[questionId];
      } catch (error) {
        setSaveState('error');
        retryRef.current[questionId] = payload;
        toast.error(getErrorMessage(error, 'Could not save answer'));
      }
    },
    [attemptId]
  );

  useEffect(() => {
    const id = setInterval(() => {
      Object.entries(retryRef.current).forEach(([questionId, payload]) => persist(questionId, payload));
    }, 4000);
    return () => clearInterval(id);
  }, [persist]);

  const submit = useMutation({
    mutationFn: () => submitAttempt(attemptId),
    onSuccess: () => {
      toast.success('Examination submitted');
      navigate('/student/history');
    },
    onError: (e) => toast.error(getErrorMessage(e))
  });

  const onExpire = useCallback(() => {
    if (expiredHandled || submit.isPending) return;
    setExpiredHandled(true);
    submit.mutate();
  }, [expiredHandled, submit]);

  const questions = useMemo(() => {
    return (query.data?.questions || []).map((q) => ({
      ...q,
      isAnswered: answers[q.questionId]?.isAnswered ?? q.isAnswered,
      isMarkedForReview: answers[q.questionId]?.isMarkedForReview ?? q.isMarkedForReview
    }));
  }, [query.data, answers]);

  if (query.isLoading) return <LoadingSpinner label="Loading examination…" />;
  if (query.error) return <ErrorState message={getErrorMessage(query.error)} onRetry={query.refetch} />;

  const attempt = query.data;
  const locked = attempt.status && attempt.status !== 'in_progress';
  const current = questions[index];
  const answeredCount = questions.filter((q) => q.isAnswered).length;
  const unansweredCount = questions.length - answeredCount;

  const updateCurrent = (selectedAnswer, isMarkedForReview) => {
    if (!current || locked) return;
    const isAnswered = Array.isArray(selectedAnswer) ? selectedAnswer.length > 0 : selectedAnswer !== null && selectedAnswer !== undefined && selectedAnswer !== '';
    const next = { selectedAnswer, isMarkedForReview, isAnswered };
    setAnswers((prev) => ({ ...prev, [current.questionId]: next }));
    persist(current.questionId, next);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
        <div>
          <p className="font-semibold">{attempt.examinationTitle}</p>
          <p className="text-xs text-slate-500">{user?.name} · {saveState === 'saving' ? 'Saving…' : saveState === 'error' ? 'Save failed — retrying' : 'All answers saved'}</p>
        </div>
        <div className="flex items-center gap-3">
          <CountdownTimer deadlineAt={attempt.deadlineAt} remainingSeconds={attempt.remainingSeconds} onExpire={onExpire} />
          <Button disabled={locked} onClick={() => setConfirm(true)}>Submit</Button>
        </div>
      </header>
      <div className="mx-auto grid max-w-6xl gap-6 p-4 lg:grid-cols-[1fr_280px] lg:p-6">
        {current && (
          <div>
            <QuestionCard
              question={current}
              index={index}
              total={questions.length}
              value={answers[current.questionId]?.selectedAnswer}
              marked={answers[current.questionId]?.isMarkedForReview}
              disabled={locked}
              onChange={(value) => updateCurrent(value, answers[current.questionId]?.isMarkedForReview)}
              onMark={(marked) => updateCurrent(answers[current.questionId]?.selectedAnswer, marked)}
            />
            <div className="mt-4 flex justify-between">
              <Button variant="secondary" disabled={index === 0} onClick={() => setIndex((i) => i - 1)}>Previous</Button>
              <Button variant="secondary" disabled={index >= questions.length - 1} onClick={() => setIndex((i) => i + 1)}>Next</Button>
            </div>
          </div>
        )}
        <QuestionNavigation questions={questions} currentIndex={index} onSelect={setIndex} />
      </div>
      <ConfirmationDialog
        open={confirm}
        title="Submit examination?"
        message={
          <div>
            <p>Answered: {answeredCount}</p>
            <p>Unanswered: {unansweredCount}</p>
            <p className="mt-2">You cannot change answers after submission.</p>
          </div>
        }
        confirmLabel="Submit now"
        busy={submit.isPending}
        onCancel={() => setConfirm(false)}
        onConfirm={() => submit.mutate()}
      />
    </div>
  );
}
