import "../../css/Modal.css";

function Modal(props) {

  if (!props.open) {
    return null;
  }

  return (
    <div
      className="modal-overlay"
      onClick={props.onClose}
    >

      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >

        <div className="modal-header">

          <h2>{props.title}</h2>

          <button onClick={props.onClose}>
            <ion-icon name="close-outline"></ion-icon>
          </button>

        </div>

        {props.children}

      </div>

    </div>
  );
}

export default Modal;