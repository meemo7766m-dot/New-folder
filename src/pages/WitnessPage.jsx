import WitnessDocumentationForm from '../components/WitnessDocumentationForm';

export default function WitnessPage() {
    return (
        <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
            <h1 style={{ color: 'var(--accent-primary)', marginBottom: '2rem', textAlign: 'center' }}>
                توثيق الشاهد
            </h1>
            <WitnessDocumentationForm />
        </div>
    );
}
