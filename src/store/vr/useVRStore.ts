import { create } from "zustand";

export interface VRTrackingData {
  headRotation: [number, number, number]; // [pitch, yaw, roll] or similar
  mouthOpen: number;
}

export interface VRParticipant {
  userId: string;
  userName: string;
  avatar: string;
  trackingData?: VRTrackingData;
  isSpeaking?: boolean;
}

interface VRAppState {
  roomId: string | null;
  userId: string | null;
  userName: string;
  selectedAvatar: string;
  isMuted: boolean;
  participants: Record<string, VRParticipant>;
  
  isSharingScreen: boolean;
  screenSharerId: string | null;
  
  
  setRoomId: (id: string | null) => void;
  setUserId: (id: string | null) => void;
  setUserName: (name: string) => void;
  setSelectedAvatar: (avatar: string) => void;
  toggleMute: () => void;
  setMute: (muted: boolean) => void;
  setIsSharingScreen: (isSharing: boolean) => void;
  setScreenSharerId: (id: string | null) => void;
  
  addParticipant: (id: string, data: VRParticipant) => void;
  removeParticipant: (id: string) => void;
  updateParticipantTracking: (id: string, trackingData: VRTrackingData) => void;
  setSpeaking: (id: string, isSpeaking: boolean) => void;
}

export const useVRStore = create<VRAppState>((set) => ({
  roomId: null,
  userId: null,
  userName: "User",
  selectedAvatar: "/avatar1.glb",
  isMuted: false,
  isSharingScreen: false,
  screenSharerId: null,
  participants: {},

  setRoomId: (id) => set({ roomId: id }),
  setUserId: (id) => set({ userId: id }),
  setUserName: (name) => set({ userName: name }),
  setSelectedAvatar: (avatar) => set({ selectedAvatar: avatar }),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  setMute: (muted) => set({ isMuted: muted }),
  setIsSharingScreen: (isSharing) => set({ isSharingScreen: isSharing }),
  setScreenSharerId: (id) => set({ screenSharerId: id }),

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
