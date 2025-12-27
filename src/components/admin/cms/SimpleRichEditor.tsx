import { useRef, useEffect } from 'react';
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, Link as LinkIcon, Undo, Redo } from 'lucide-react';

interface SimpleRichEditorProps {
    value: string;
    onChange: (html: string) => void;
    className?: string; // Add className prop
}

export function SimpleRichEditor({ value, onChange, className }: SimpleRichEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    // const [isFocused, setIsFocused] = useState(false);

    // Initial load
    useEffect(() => {
        if (editorRef.current && value && editorRef.current.innerHTML !== value) {
            // Only update if significantly different to avoid cursor jumping
            // A simple check: if empty, set it. If not empty, we assume user is typing.
            // For a perfect sync, we'd need more complex logic, but for this use case:
            if (editorRef.current.innerHTML === '') {
                editorRef.current.innerHTML = value;
            }
        }
    }, []);

    const handleInput = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    const execCmd = (command: string, value: string | undefined = undefined) => {
        document.execCommand(command, false, value);
        if (editorRef.current) {
            editorRef.current.focus();
        }
    };

    return (
        <div className={`border border-gray-300 rounded-lg overflow-hidden bg-white flex flex-col ${className}`}>
            {/* Toolbar */}
            <div className="flex flex-wrap gap-1 p-2 bg-gray-50 border-b border-gray-200">
                <ToolbarButton onClick={() => execCmd('formatBlock', '<h3>')} icon={<Heading1 size={18} />} title="Grand Titre" />
                <ToolbarButton onClick={() => execCmd('formatBlock', '<h4>')} icon={<Heading2 size={16} />} title="Petit Titre" />
                <div className="w-px h-6 bg-gray-300 mx-1 self-center" />
                <ToolbarButton onClick={() => execCmd('bold')} icon={<Bold size={18} />} title="Gras" />
                <ToolbarButton onClick={() => execCmd('italic')} icon={<Italic size={18} />} title="Italique" />
                <div className="w-px h-6 bg-gray-300 mx-1 self-center" />
                <ToolbarButton onClick={() => execCmd('insertUnorderedList')} icon={<List size={18} />} title="Liste à puces" />
                <ToolbarButton onClick={() => execCmd('insertOrderedList')} icon={<ListOrdered size={18} />} title="Liste numérotée" />
                <div className="w-px h-6 bg-gray-300 mx-1 self-center" />
                <ToolbarButton onClick={() => {
                    const url = prompt('Entrez l\'URL du lien:');
                    if (url) execCmd('createLink', url);
                }} icon={<LinkIcon size={18} />} title="Lien" />
                <div className="flex-1" />
                <ToolbarButton onClick={() => execCmd('undo')} icon={<Undo size={16} />} title="Annuler" />
                <ToolbarButton onClick={() => execCmd('redo')} icon={<Redo size={16} />} title="Rétablir" />
            </div>

            {/* Editable Area */}
            <div
                ref={editorRef}
                className="flex-1 p-4 outline-none prose max-w-none overflow-y-auto min-h-[300px]"
                contentEditable
                onInput={handleInput}
                dangerouslySetInnerHTML={{ __html: value }}
            />
        </div>
    );
}

function ToolbarButton({ onClick, icon, title }: { onClick: () => void, icon: React.ReactNode, title: string }) {
    return (
        <button
            onClick={(e) => {
                e.preventDefault(); // Prevent changing focus lost
                onClick();
            }}
            title={title}
            className="p-1.5 text-gray-600 hover:bg-gray-200 rounded transition-colors hover:text-gray-900"
            type="button"
        >
            {icon}
        </button>
    );
}
