import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaUserCircle } from "react-icons/fa";
import { thunkLogout } from "../../redux/session";
import OpenModalMenuItem from "./OpenModalMenuItem";
import LoginFormModal from "../LoginFormModal";
import SignupFormModal from "../SignupFormModal";
import "./ProfileButton.css";

function ProfileButton() {
  const dispatch = useDispatch();
  const [showMenu, setShowMenu] = useState(false);
  const user = useSelector((store) => store.session.user);
  const ulRef = useRef();

  const toggleMenu = (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  useEffect(() => {
    if (!showMenu) return;

    const closeMenu = (e) => {
      if (ulRef.current && !ulRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("click", closeMenu);

    return () => document.removeEventListener("click", closeMenu);
  }, [showMenu]);

  const closeMenu = () => setShowMenu(false);

  const logout = (e) => {
    e.preventDefault();
    dispatch(thunkLogout());
    closeMenu();
  };

  return (
    <div className="profile-container">
      <button onClick={toggleMenu} className="profile-icon-button">
        <FaUserCircle size={28} />
      </button>
      {showMenu && (
        <div className="profile-dropdown" ref={ulRef}>
          {user ? (
            <>
              <div className="user-info">
                <p className="username">{user.username}</p>
                <p className="email">{user.email}</p>
              </div>
              <div className="dropdown-divider"></div>
              <button onClick={logout} className="dropdown-item logout-button">
                Log Out
              </button>
            </>
          ) : (
            <div className="auth-options">
              <OpenModalMenuItem
                itemText="Log In"
                onItemClick={closeMenu}
                modalComponent={<LoginFormModal />}
                className="dropdown-item"
              />
              <OpenModalMenuItem
                itemText="Sign Up"
                onItemClick={closeMenu}
                modalComponent={<SignupFormModal />}
                className="dropdown-item"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ProfileButton;
