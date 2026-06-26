import type { ModalName } from "#build/types/modal-options";

export const useModal = () => {
  const modal = useState<ModalName | null>(() => null);
  const setModal = (selectedModal: ModalName | null) => {
    modal.value = selectedModal;
  };

  return {
    modal,
    setModal,
  };
};
