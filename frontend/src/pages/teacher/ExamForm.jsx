import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { createExamination, getExamination, updateExamination } from '../../lib/api/examinations';
import { listQuestions } from '../../lib/api/questions';
import { getErrorMessage } from '../../utils/errors';
import { fromDatetimeLocal, toDatetimeLocal } from '../../utils/datetime';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Field, { Input, Textarea, Select, Button } from '../../components/forms/Field';

const empty = {
  title: '',
  description: '',
  subject: '',
  instructions: 'Read all questions carefully. The timer is enforced by the server. Answers save automatically. One attempt is allowed.',
  duration: 60,
  passingMarks: 0,
  negativeMarkingEnabled: false,
  shuffleQuestions: false,
  shuffleOptions: false,
  startTime: '',
  endTime: '',
  resultPublicationMode: 'manual',
  questionIds: []
};

export default function ExamForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [search, setSearch] = useState('');

  const examQuery = useQuery({ queryKey: ['examination', id], queryFn: () => getExamination(id), enabled: !!id });
  const questionsQuery = useQuery({
    queryKey: ['questions', 'picker', search],
    queryFn: () => listQuestions({ search: search || undefined, limit: 50, page: 1 })
  });

  useEffect(() => {
    if (!examQuery.data) return;
    const exam = examQuery.data;
    setForm({
      title: exam.title || '',
      description: exam.description || '',
      subject: exam.subject || '',
      instructions: exam.instructions || empty.instructions,
      duration: exam.duration || 60,
      passingMarks: exam.passingMarks || 0,
      negativeMarkingEnabled: !!exam.negativeMarkingEnabled,
      shuffleQuestions: !!exam.shuffleQuestions,
      shuffleOptions: !!exam.shuffleOptions,
      startTime: toDatetimeLocal(exam.startTime),
      endTime: toDatetimeLocal(exam.endTime),
      resultPublicationMode: exam.resultPublicationMode || 'manual',
      questionIds: (exam.questions || []).map((q) => q.questionId || q._id)
    });
  }, [examQuery.data]);

  const selectedMarks = useMemo(() => {
    const bank = questionsQuery.data?.data || [];
    const examQs = examQuery.data?.questions || [];
    return form.questionIds.reduce((sum, qid) => {
      const fromBank = bank.find((q) => q._id === qid);
      const fromExam = examQs.find((q) => (q.questionId || q._id) === qid);
      return sum + Number(fromBank?.marks || fromExam?.marks || 0);
    }, 0);
  }, [form.questionIds, questionsQuery.data, examQuery.data]);

  const mutation = useMutation({
    mutationFn: (payload) => (id ? updateExamination(id, payload) : createExamination(payload)),
    onSuccess: (exam) => {
      toast.success(id ? 'Examination updated' : 'Examination created');
      navigate(`/teacher/examinations/${exam._id}`);
    },
    onError: (e) => toast.error(getErrorMessage(e))
  });

  if (id && examQuery.isLoading) return <LoadingSpinner />;

  const toggleQuestion = (qid) => {
    setForm((prev) => ({
      ...prev,
      questionIds: prev.questionIds.includes(qid) ? prev.questionIds.filter((id) => id !== qid) : [...prev.questionIds, qid]
    }));
  };

  const submit = (e) => {
    e.preventDefault();
    mutation.mutate({
      title: form.title,
      description: form.description,
      subject: form.subject,
      instructions: form.instructions,
      duration: Number(form.duration),
      passingMarks: Number(form.passingMarks),
      negativeMarkingEnabled: form.negativeMarkingEnabled,
      shuffleQuestions: form.shuffleQuestions,
      shuffleOptions: form.shuffleOptions,
      startTime: fromDatetimeLocal(form.startTime),
      endTime: fromDatetimeLocal(form.endTime),
      resultPublicationMode: form.resultPublicationMode,
      questionIds: form.questionIds
    });
  };

  return (
    <form className="space-y-6" onSubmit={submit}>
      <PageHeader title={id ? 'Schedule / edit examination' : 'Create examination'} description="Times are stored in UTC and shown in your local timezone." />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2">
          <Field label="Title"><Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
          <Field label="Subject"><Input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></Field>
          <Field label="Description"><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
          <Field label="Instructions"><Textarea value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} /></Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Start"><Input type="datetime-local" required value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} /></Field>
            <Field label="End"><Input type="datetime-local" required value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} /></Field>
            <Field label="Duration (minutes)"><Input type="number" min="1" required value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} /></Field>
            <Field label="Passing marks"><Input type="number" min="0" required value={form.passingMarks} onChange={(e) => setForm({ ...form, passingMarks: e.target.value })} /></Field>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.negativeMarkingEnabled} onChange={(e) => setForm({ ...form, negativeMarkingEnabled: e.target.checked })} /> Negative marking</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.shuffleQuestions} onChange={(e) => setForm({ ...form, shuffleQuestions: e.target.checked })} /> Shuffle questions</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.shuffleOptions} onChange={(e) => setForm({ ...form, shuffleOptions: e.target.checked })} /> Shuffle options</label>
            <Field label="Result publication">
              <Select value={form.resultPublicationMode} onChange={(e) => setForm({ ...form, resultPublicationMode: e.target.value })}>
                <option value="manual">Manual</option>
                <option value="auto">Automatic after evaluation</option>
              </Select>
            </Field>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold">Question picker</h2>
          <p className="mt-1 text-sm text-slate-500">{form.questionIds.length} selected · {selectedMarks} marks</p>
          <Input className="mt-3" placeholder="Filter bank" value={search} onChange={(e) => setSearch(e.target.value)} />
          <div className="mt-3 max-h-96 space-y-2 overflow-y-auto">
            {(questionsQuery.data?.data || []).map((q) => (
              <label key={q._id} className="flex cursor-pointer items-start gap-2 rounded-xl border border-slate-100 p-2 text-sm">
                <input type="checkbox" checked={form.questionIds.includes(q._id)} onChange={() => toggleQuestion(q._id)} />
                <span>
                  <span className="block font-medium">{q.questionText}</span>
                  <span className="text-xs text-slate-500">{q.questionType} · {q.marks} marks · {q.difficulty}</span>
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
      <Button type="submit" loading={mutation.isPending}>Save examination</Button>
    </form>
  );
}
