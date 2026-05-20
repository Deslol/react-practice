export interface NotesPanelState {
    isPanelOpen: boolean;
    draft: string;
    notes: string[];
    togglePanelOpen: () => void;
    setDraft: (draft: string) => void;
    addNote: () => void;
    clearNotes: () => void;
}