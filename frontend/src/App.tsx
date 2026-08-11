import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home/Home";
import { Login } from "./pages/Auth/Login";
import { Register } from "./pages/Auth/Register";
import { Wardrobe } from "./pages/WardrobeList/Wardrobe";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ClothingItemExpanded } from "./pages/WardrobeList/ClothingItemExpanded";
import { Listings } from "./pages/Listings/Listings";
import { Profile } from "./pages/Profile/Profile";
import { MyDetails } from "./pages/Profile/MyDetails";
import { MyFavourites } from "./pages/Profile/MyFavourites";
import { MyOutfits } from "./pages/Profile/MyOutfits";
import { MyTransactions } from "./pages/Profile/MyTransactions";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/wardrobe" element={<Wardrobe />} />
              <Route path="/wardrobe/:id" element={<ClothingItemExpanded />} />
              <Route path="/profile" element={<Profile />}>
                <Route index element={<MyDetails />} />
                <Route path="favourites" element={<MyFavourites />} />
                <Route path="outfits" element={<MyOutfits />} />
                <Route path="transactions" element={<MyTransactions />} />
              </Route>
              <Route path="/listings" element={<Listings />} />
            </Route>
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
