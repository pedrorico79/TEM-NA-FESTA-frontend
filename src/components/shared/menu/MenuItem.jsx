function MenuItem(props) {

  return (
    <button className={`menu-item ${props.active ? "active" : ""} ${props.subItem ? "sub-item" : ""}`}>

      <div className="menu-item-left">

        {props.icon && (<ion-icon name={props.icon}></ion-icon>)}

        {props.image && (<img src={props.image} alt="" className="menu-icon"/>)}

        <span>{props.text}</span>

      </div>

      {props.arrow && (<ion-icon name={props.open ? "chevron-down-outline" : "chevron-forward-outline"} className="menu-arrow"></ion-icon>)}

    </button>
  );
}

export default MenuItem;