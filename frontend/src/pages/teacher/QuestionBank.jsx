import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { listQuestions, deleteQuestion } from '../../lib/api/questions';
import { getErrorMessage } from '../../utils/errors';
import PageHeader from '../../components/common/PageHeader';
import SearchBar from '../../components/common/SearchBar';
import FilterDropdown from '../../components/common/FilterDropdown';
import Pagination from '../../components/common/Pagination';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import { Button } from '../../components/forms/Field';

export default function QuestionBank() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [questionType, setQuestionType] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState(null);

  const query = useQuery({
    queryKey: ['questions', { search, difficulty, questionType, category, page }],
    queryFn: () =>
      listQuestions({
        search: search || undefined,
        difficulty: difficulty || undefined,
        questionType: questionType || undefined,
        category: category || undefined,
        page,
        limit: 20
      })
  });

  const del = useMutation({
    mutationFn: deleteQuestion,
    onSuccess: () => {
      toast.success('Question deleted');
      setPendingDelete(null);
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    },
    onError: (e) => toast.error(getErrorMessage(e))
  });

  if (query.isLoading) return <LoadingSpinner />;
  if (query.error) return <ErrorState message={getErrorMessage(query.error)} onRetry={query.refetch} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Question bank"
        description="Create reusable objective questions for your examinations."
        actions={<Link to="/teacher/questions/new"><Button>Create question</Button></Link>}
      />
      <div className="flex flex-col gap-3 lg:flex-row">
        <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search question text" />
        <input value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} placeholder="Category" className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
        <FilterDropdown value={difficulty} onChange={(v) => { setDifficulty(v); setPage(1); }} options={[{ value: '', label: 'All difficulty' }, { value: 'easy', label: 'Easy' }, { value: 'medium', label: 'Medium' }, { value: 'hard', label: 'Hard' }]} />
        <FilterDropdown value={questionType} onChange={(v) => { setQuestionType(v); setPage(1); }} options={[{ value: '', label: 'All types' }, { value: 'MCQ', label: 'MCQ' }, { value: 'MULTIPLE_SELECT', label: 'Multiple select' }, { value: 'TRUE_FALSE', label: 'True / False' }, { value: 'FILL_BLANKS', label: 'Fill blanks' }]} />
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-2">
        <DataTable
          rows={query.data.data}
          columns={[
            { key: 'questionText', header: 'Question', render: (q) => <div className="max-w-md"><p className="font-medium">{q.questionText}</p><p className="text-xs text-slate-500">{q.category} · {q.marks} marks</p></div> },
            { key: 'questionType', header: 'Type', render: (q) => q.questionType.replaceAll('_', ' ') },
            { key: 'difficulty', header: 'Difficulty', render: (q) => <StatusBadge value={q.difficulty} /> },
            {
              key: 'actions',
              header: '',
              render: (q) => (
                <div className="flex gap-2">
                  <Link className="text-sm font-medium text-indigo-700" to={`/teacher/questions/${q._id}`}>Preview</Link>
                  <Link className="text-sm font-medium text-slate-600" to={`/teacher/questions/${q._id}/edit`}>Edit</Link>
                  <button className="text-sm font-medium text-rose-600" onClick={() => setPendingDelete(q)}>Delete</button>
                </div>
              )
            }
          ]}
        />
      </div>
      <Pagination pagination={query.data.pagination} onPage={setPage} />
      <ConfirmationDialog
        open={!!pendingDelete}
        title="Delete question?"
        message="This cannot be undone if the question is not locked by an examination."
        confirmLabel="Delete"
        tone="rose"
        busy={del.isPending}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => del.mutate(pendingDelete._id)}
      />
    </div>
  );
}
