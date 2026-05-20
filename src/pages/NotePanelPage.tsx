import {useNotesPanelStore} from "../store/zustand/useNotesPanelStore.ts";

export default function NotePanelPage() {
    const draft = useNotesPanelStore((state)=> state.draft);
    const notes = useNotesPanelStore((state)=> state.notes);
    const isPanelOpen = useNotesPanelStore((state) => state.isPanelOpen);
    const togglePanelOpen = useNotesPanelStore((state) => state.togglePanelOpen);
    const addNote = useNotesPanelStore((state) => state.addNote);
    const setDraft = useNotesPanelStore((state)=> state.setDraft);
    const clearNotes = useNotesPanelStore((state)=> state.clearNotes);

    return (
        <div>
            <h2>Note Panel</h2>

            <button onClick={togglePanelOpen}>{isPanelOpen ? `Close`: 'Open'} Note Panel</button>

            {isPanelOpen && <div>
                <label>Draft Note</label>
                <input type="text" value={draft} onChange={(e) => setDraft(e.target.value)} />
                <button onClick={addNote}>Save Draft Note</button>
            </div>}

            <h3>Saved Notes</h3>
            <ul>
                {notes.map((note, index)=> {
                    return (
                        <li key={index}>
                            {note}
                        </li>
                    )
                })}
            </ul>
            <button onClick={clearNotes}>Clear Notes</button>
        </div>
    )
}