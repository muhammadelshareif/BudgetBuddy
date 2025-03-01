import { NavLink, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import ProfileButton from "./ProfileButton";
import "./Navigation.css";

function Navigation() {
  const sessionUser = useSelector((state) => state.session.user);
  const location = useLocation();
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/signup";

  return (
    <nav className="navigation">
      <div className="nav-left">
        <NavLink to="/" className="logo">
          BudgetBuddy
        </NavLink>
      </div>

      <div className="nav-right">
        {sessionUser && (
          <>
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/transactions">Transactions</NavLink>
            <NavLink to="/categories">Categories</NavLink>
            <NavLink to="/budgets">Budgets</NavLink>
            <NavLink to="/savings">Savings Goals</NavLink>
          </>
        )}
        {!isAuthPage && <ProfileButton />}
      </div>
    </nav>
  );
}

export default Navigation;
