import ComplaintSuggestionForm from '../components/ComplaintSuggestionForm';

export default function ComplaintsPage() {
    return (
        <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
            <h1 style={{ color: 'var(--accent-primary)', marginBottom: '2rem', textAlign: 'center' }}>
                شكاوى واقتراحات
            </h1>
            <ComplaintSuggestionForm />
        </div>
    );
}
