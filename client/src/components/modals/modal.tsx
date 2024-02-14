import ReactDOM from "react-dom";

import { Backdrop } from "./backdrop";
import { ModalOverlay, ModalOverlayProps } from "./modal-overlay";

// eslint-disable-next-line react-refresh/only-export-components
export enum OverlayType {
  NEW_POST,
  NEW_COMMENT,
  ERROR,
}

const overlay = new Map<OverlayType, ModalOverlayProps>();
overlay.set(OverlayType.NEW_POST, {
  heading: "New Post",
  message: "Start composing your post...",
  buttonText: "Post",
  writable: true,
  onProceed: () => {
    // Save Post to DB
    console.log("NEW POST SAVED.");
  },
});

interface ModalProps {
  type: OverlayType;
  strict: boolean;
  onClose: () => void;
}

export const Modal = ({ type, strict, onClose }: ModalProps) => {
  const overlayProps: ModalOverlayProps = {
    heading: overlay.get(type)!.heading,
    message: overlay.get(type)!.message,
    buttonText: overlay.get(type)!.buttonText,
    writable: overlay.get(type)!.writable,
    onProceed: overlay.get(type)!.onProceed,
  };

  return (
    <>
      {ReactDOM.createPortal(
        <Backdrop onClose={onClose} />,
        document.getElementById("backdrop-root")!
      )}
      {/* {props.newpost} */}
      {type === OverlayType.NEW_POST &&
        ReactDOM.createPortal(
          <ModalOverlay
            {...overlayProps}
            // heading={props.heading}
            // onConfirm={props.onConfirm}
          />,
          document.getElementById("modal-overlay-root")!
        )}
      {/* {props.newcomment &&
    ReactDOM.createPortal(
      <NewCommentOverlay
        heading={props.heading}
        onConfirm={props.onConfirm}
        handleCommentState={props.commentStateChanger}
      />,
      document.getElementById('modal-overlay-root')
    )}
  {props.updateInfo &&
    ReactDOM.createPortal(
      <UpdateInfoOverlay
        heading={props.heading}
        onConfirm={props.onConfirm}
        setUserData={props.setUserData}
      />,
      document.getElementById('modal-overlay-root')
    )}
  {!props.newpost &&
    !props.newcomment &&
    !props.updateInfo &&
    ReactDOM.createPortal(
      <ModalOverlay
        heading={props.heading}
        message={props.message}
        onConfirm={props.onConfirm}
      />,
      document.getElementById('modal-overlay-root')
    )} */}
    </>
  );
};
