// Fix: Function Parameter
interface BackdropProps {
  onClose: () => void;
  // TO-DO
  // strict: boolean; // If strict is true, just clicking on backdrop shouldn't closr the overlay
}

export const Backdrop = ({ onClose }: BackdropProps) => {
  return (
    <div
      className="fixed top-0 left-0 w-full h-screen z-20 bg-black bg-opacity-80"
      onClick={onClose}
    />
  );
};
