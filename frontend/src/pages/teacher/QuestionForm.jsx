import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { createQuestion, getQuestion, updateQuestion } from '../../lib/api/questions';
import { getErrorMessage } from '../../utils/errors';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Field, { Input, Textarea, Select, Button } from '../../components/forms/Field';

const empty = {
  questionText: '',
  questionType: 'MCQ',
  options: ['', '', '', ''],
  correctAnswer: '',
  acceptedAnswers: '',
  marks: 1,
  negativeMarks: 0,
  difficulty: 'medium',
  category: '',
  explanation: ''
};

function toPayload(form) {
  const options = (form.options || []).map((o) => o.trim()).filter(Boolean);
  let correctAnswer = form.correctAnswer;
  if (form.questionType === 'MULTIPLE_SELECT') {
    correctAnswer = Array.isArray(form.correctAnswer) ? form.correctAnswer : String(form.correctAnswer).split(',').map((s) => s.trim()).filter(Boolean);
  }
  if (form.questionType === 'TRUE_FALSE') {
    correctAnswer = form.correctAnswer === true || form.correctAnswer === 'true';
  }
  return {
    questionText: form.questionText,
    questionType: form.questionType,
    options: form.questionType === 'FILL_BLANKS' ? [] : options,
    correctAnswer,
    acceptedAnswers: form.acceptedAnswers
      ? String(form.acceptedAnswers).split(',').map((s) => s.trim()).filter(Boolean)
      : [],
    marks: Number(form.marks),
    negativeMarks: Number(form.negativeMarks || 0),
    difficulty: form.difficulty,
    category: form.category,
    explanation: form.explanation
  };
}

export default function QuestionForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const existing = useQuery({
    queryKey: ['question', id],
    queryFn: () => getQuestion(id),
    enabled: !!id
  });

  useEffect(() => {
    if (existing.data) {
      const q = existing.data;
      setForm({
        ...empty,
        ...q,
        options: q.options?.length ? q.options : ['', '', '', ''],
        acceptedAnswers: (q.acceptedAnswers || []).join(', '),
        correctAnswer: q.questionType === 'MULTIPLE_SELECT' ? q.correctAnswer : q.correctAnswer
      });
    }
  }, [existing.data]);

  const mutation = useMutation({
    mutationFn: (payload) => (id ? updateQuestion(id, payload) : createQuestion(payload)),
    onSuccess: (q) => {
      toast.success(id ? 'Question updated' : 'Question created');
      navigate(`/teacher/questions/${q._id}`);
    },
    onError: (e) => toast.error(getErrorMessage(e))
  });

  if (id && existing.isLoading) return <LoadingSpinner />;

  const setOption = (i, value) => {
    const options = [...form.options];
    options[i] = value;
    setForm({ ...form, options });
  };

  const toggleMulti = (opt) => {
    const current = Array.isArray(form.correctAnswer) ? form.correctAnswer : [];
    const next = current.includes(opt) ? current.filter((v) => v !== opt) : [...current, opt];
    setForm({ ...form, correctAnswer: next });
  };

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate(toPayload(form));
      }}
    >
      <PageHeader title={id ? 'Edit question' : 'Create question'} description="Objective questions are auto-evaluated after submission." />
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
        <Field label="Question text">
          <Textarea required value={form.questionText} onChange={(e) => setForm({ ...form, questionText: e.target.value })} />
        </Field>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Type">
            <Select value={form.questionType} onChange={(e) => setForm({ ...form, questionType: e.target.value, correctAnswer: e.target.value === 'MULTIPLE_SELECT' ? [] : '' })}>
              <option value="MCQ">Multiple choice</option>
              <option value="MULTIPLE_SELECT">Multiple select</option>
              <option value="TRUE_FALSE">True / False</option>
              <option value="FILL_BLANKS">Fill in the blanks</option>
            </Select>
          </Field>
          <Field label="Difficulty">
            <Select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </Select>
          </Field>
          <Field label="Category">
            <Input required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          </Field>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Marks">
            <Input type="number" min="0.5" step="0.5" required value={form.marks} onChange={(e) => setForm({ ...form, marks: e.target.value })} />
          </Field>
          <Field label="Negative marks">
            <Input type="number" min="0" step="0.5" value={form.negativeMarks} onChange={(e) => setForm({ ...form, negativeMarks: e.target.value })} />
          </Field>
        </div>

        {form.questionType !== 'FILL_BLANKS' && form.questionType !== 'TRUE_FALSE' && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Options</p>
            {form.options.map((opt, i) => (
              <Input key={i} value={opt} placeholder={`Option ${i + 1}`} onChange={(e) => setOption(i, e.target.value)} />
            ))}
            <Button type="button" variant="secondary" onClick={() => setForm({ ...form, options: [...form.options, ''] })}>
              Add option
            </Button>
          </div>
        )}

        {form.questionType === 'MCQ' && (
          <Field label="Correct answer">
            <Select value={form.correctAnswer} onChange={(e) => setForm({ ...form, correctAnswer: e.target.value })}>
              <option value="">Select option</option>
              {form.options.filter(Boolean).map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </Select>
          </Field>
        )}

        {form.questionType === 'MULTIPLE_SELECT' && (
          <div>
            <p className="mb-2 text-sm font-medium">Correct answers</p>
            {form.options.filter(Boolean).map((opt) => (
              <label key={opt} className="mr-4 inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={(form.correctAnswer || []).includes(opt)} onChange={() => toggleMulti(opt)} />
                {opt}
              </label>
            ))}
          </div>
        )}

        {form.questionType === 'TRUE_FALSE' && (
          <Field label="Correct answer">
            <Select value={String(form.correctAnswer)} onChange={(e) => setForm({ ...form, correctAnswer: e.target.value })}>
              <option value="true">True</option>
              <option value="false">False</option>
            </Select>
          </Field>
        )}

        {form.questionType === 'FILL_BLANKS' && (
          <>
            <Field label="Correct answer">
              <Input required value={form.correctAnswer} onChange={(e) => setForm({ ...form, correctAnswer: e.target.value })} />
            </Field>
            <Field label="Accepted alternatives" hint="Comma-separated">
              <Input value={form.acceptedAnswers} onChange={(e) => setForm({ ...form, acceptedAnswers: e.target.value })} />
            </Field>
          </>
        )}

        <Field label="Explanation (optional)">
          <Textarea value={form.explanation} onChange={(e) => setForm({ ...form, explanation: e.target.value })} />
        </Field>
        <Button type="submit" loading={mutation.isPending}>{id ? 'Save changes' : 'Create question'}</Button>
      </div>
    </form>
  );
}
