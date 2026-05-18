import { create } from "zustand";

export interface TrackingData {
  headRotation: [number, number, number];
  mouthOpen: number;
  eyeBlinkLeft: number;
  eyeBlinkRight: number;
}

export interface Participant {
  userId: string;
  userName: string;
  avatar: string;
  trackingData?: TrackingData;
  isSpeaking?: boolean;
}

interface AppState {
  roomId: string | null;
  userId: string | null;
  userName: string;
  selectedAvatar: string;
  isMuted: boolean;
  participants: Record<string, Participant>;
  
  setRoomId: (id: string | null) => void;
  setUserId: (id: string | null) => void;
  setUserName: (name: string) => void;
  setSelectedAvatar: (avatar: string) => void;
  toggleMute: () => void;
  setMute: (muted: boolean) => void;
  
  addParticipant: (id: string, data: Participant) => void;
  removeParticipant: (id: string) => void;
  updateParticipantTracking: (id: string, trackingData: TrackingData) => void;
  setSpeaking: (id: string, isSpeaking: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  roomId: null,
  userId: null,
  userName: "User",
  selectedAvatar: "/avatar1.glb",
  isMuted: false,
  participants: {},

  setRoomId: (id) => set({ roomId: id }),
  setUserId: (id) => set({ userId: id }),
  setUserName: (name) => set({ userName: name }),
  setSelectedAvatar: (avatar) => set({ selectedAvatar: avatar }),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  setMute: (muted) => set({ isMuted: muted }),

  addParticipant: (id, data) => 
    set((state) => ({
      participants: { ...state.participants, [id]: data }
    })),
    
  removeParticipant: (id) => 
    set((state) => {
      const { [id]: removed, ...rest } = state.participants;
      return { participants: rest };
    }),
    
  updateParticipantTracking: (id, trackingData) =>
    set((state) => {
      const existing = state.participants[id];
      if (!existing) return state;
      return {
        participants: {
          ...state.participants,
          [id]: { ...existing, trackingData }
        }
      };
    }),
    
  setSpeaking: (id, isSpeaking) =>
    set((state) => {
      const existing = state.participants[id];
      if (!existing) return state;
      return {
        participants: {
          ...state.participants,
          [id]: { ...existing, isSpeaking }
        }
      };
    })
}));
