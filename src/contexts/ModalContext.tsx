import React, { createContext, useContext, useState } from 'react';

export type ModalType = 'booking' | 'details';

interface ModalContextType {
  openModal: (courseType: 'dj' | 'production', modalType: ModalType) => void;
  closeModal: () => void;
  isOpen: boolean;
  lessonType: 'dj' | 'production';
  modalType: ModalType | null;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [lessonType, setLessonType] = useState<'dj' | 'production'>('dj');
  const [modalType, setModalType] = useState<ModalType | null>(null);

  const openModal = (lessonType: 'dj' | 'production', modalType: ModalType) => {
    setLessonType(lessonType);
    setModalType(modalType);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setModalType(null);
  };

  return (
    <ModalContext.Provider value={{ isOpen, lessonType, modalType, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}