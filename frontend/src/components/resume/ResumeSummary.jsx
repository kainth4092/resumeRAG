export default function ResumeSummary({ summary }) {

    return (
        <section>
            <h2 className="text-lg font-bold border-b pb-1 mb-2">
                Professional Summary
            </h2>
            <p className="text-sm leading-7">
                {summary}
            </p>
        </section>
    );
}