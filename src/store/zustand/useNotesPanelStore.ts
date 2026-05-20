import {create} from "zustand";
import type {NotesPanelState} from "../../interfaces/notePanel.ts";

export const useNotesPanelStore = create<NotesPanelState>()((set, get) => ({
    isPanelOpen: false,
    draft: "",
    notes: [],
    togglePanelOpen: () => set((state) => ({isPanelOpen: !state.isPanelOpen})),
    setDraft: (draft: string) => {
        set(() => ({draft}))
    },
    addNote: () => {
        const trimmedDraft = get().draft.trim();
        if (!trimmedDraft) return;
        set((state) => ({notes: [...state.notes, trimmedDraft], draft: ""}));
    },
    clearNotes: () => set(() => ({
        notes: []
    })),
}))