import { create } from 'zustand';
import {
  DrawingState,
  DrawingPath,
  CanvasText,
  CanvasImage,
  Position,
  DeleteModalState,
  MediaSettings,
} from '@/types/canvas';

interface StudioState {
  screenStream: MediaStream | null;
  mediaStream: MediaStream | null;
  isStreaming: boolean;
  screenPosition: Position;
  camPosition: Position;

  drawingState: DrawingState;
  paths: DrawingPath[];
  currentPath: DrawingPath | null;

  texts: CanvasText[];
  images: CanvasImage[];

  setScreenPosition: (position: Position) => void;
  setCamPosition: (position: Position) => void;
  setScreenStream: (stream: MediaStream | null) => void;
  setMediaStream: (stream: MediaStream | null) => void;
  setIsStreaming: (streaming: boolean) => void;
  setDrawingState: (state: Partial<DrawingState>) => void;
  setPaths: (paths: DrawingPath[]) => void;
  setCurrentPath: (path: DrawingPath | null) => void;
  setTexts: (texts: CanvasText[]) => void;
  setImages: (images: CanvasImage[]) => void;
  clearAll: () => void;

  deleteModal: DeleteModalState;
  setDeleteModal: (modal: DeleteModalState) => void;

  mediaSettings: MediaSettings | null;
  setMediaSettings: (settings: MediaSettings | null) => void;
  activeTool: 'text' | 'draw' | 'erase' | null;
  setActiveTool: (tool: 'text' | 'draw' | 'erase' | null) => void;
  cleanup: () => void;
}

const initialDrawingState: DrawingState = {
  isDrawing: false,
  isErasing: false,
  isTexting: false,
  drawTool: {
    color: '#ffffff',
    width: 5,
  },
  eraseTool: {
    width: 20,
  },
  textTool: {
    color: '#ffffff',
    width: 10,
  },
};

export const useStudioStore = create<StudioState>(set => ({
  screenStream: null,
  mediaStream: null,
  isStreaming: false,
  screenPosition: { x: 0, y: 0, width: 792, height: 446 },
  camPosition: { x: 20, y: 20, width: 240, height: 180 },

  drawingState: initialDrawingState,
  paths: [],
  currentPath: null,
  texts: [],
  images: [],

  setScreenPosition: position => set({ screenPosition: position }),
  setCamPosition: position => set({ camPosition: position }),
  setScreenStream: stream => set({ screenStream: stream }),
  setMediaStream: stream => set({ mediaStream: stream }),
  setIsStreaming: streaming => set({ isStreaming: streaming }),
  setDrawingState: newState =>
    set(state => {
      if (newState.isTexting && (newState.isDrawing || newState.isErasing)) {
        newState.isDrawing = false;
        newState.isErasing = false;
      }
      if ((newState.isDrawing || newState.isErasing) && newState.isTexting) {
        newState.isTexting = false;
      }

      return {
        drawingState: {
          ...state.drawingState,
          ...newState,
        },
      };
    }),
  setPaths: paths => set({ paths }),
  setCurrentPath: path => set({ currentPath: path }),
  setTexts: texts => set({ texts }),
  setImages: images => set({ images }),

  clearAll: () =>
    set({
      paths: [],
      currentPath: null,
      texts: [],
      images: [],
      drawingState: initialDrawingState,
      activeTool: null,
    }),

  deleteModal: {
    show: false,
    x: 0,
    y: 0,
    type: 'text',
    targetId: '',
  },
  setDeleteModal: modal => set({ deleteModal: modal }),

  mediaSettings: null,
  setMediaSettings: settings => set({ mediaSettings: settings }),
  activeTool: null,
  setActiveTool: tool => set({ activeTool: tool }),
  cleanup: () =>
    set(state => {
      if (state.screenStream) {
        state.screenStream.getTracks().forEach(track => track.stop());
      }

      if (state.mediaStream) {
        state.mediaStream.getTracks().forEach(track => track.stop());
      }

      return {
        screenStream: null,
        mediaStream: null,
        isStreaming: false,
        paths: [],
        currentPath: null,
        texts: [],
        images: [],
        drawingState: initialDrawingState,
        activeTool: null,
        mediaSettings: null,
        deleteModal: {
          show: false,
          x: 0,
          y: 0,
          type: 'text',
          targetId: '',
        },
      };
    }),
}));
