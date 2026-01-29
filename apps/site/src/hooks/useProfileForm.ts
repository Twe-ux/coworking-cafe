import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import type {
  ProfileFormData,
  ProfileMessage,
  UpdateUserProfileResponse,
  ProfileErrorResponse,
} from "../types/user";

interface UseProfileFormProps {
  name: string;
  email: string;
  phone?: string;
  companyName?: string;
}

interface UseProfileFormReturn {
  profileData: ProfileFormData;
  message: ProfileMessage;
  loading: boolean;
  isEditingProfile: boolean;
  setIsEditingProfile: (value: boolean) => void;
  setMessage: (value: ProfileMessage) => void;
  handleProfileSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  handleInputChange: (field: keyof ProfileFormData, value: string) => void;
  handleCancelEdit: () => void;
}

/**
 * Custom hook for managing profile form state and submission
 */
export function useProfileForm(
  props: UseProfileFormProps,
): UseProfileFormReturn {
  const { name, email, phone, companyName } = props;
  const { update } = useSession();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<ProfileMessage>({
    type: "",
    text: "",
  });

  const [profileData, setProfileData] = useState<ProfileFormData>({
    name: name || "",
    email: email || "",
    phone: phone || "",
    companyName: companyName || "",
  });

  // Update profile data when props change
  useEffect(() => {
    setProfileData({
      name: name || "",
      email: email || "",
      phone: phone || "",
      companyName: companyName || "",
    });
  }, [name, email, phone, companyName]);

  const handleInputChange = (
    field: keyof ProfileFormData,
    value: string,
  ): void => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleProfileSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });

      const data: UpdateUserProfileResponse | ProfileErrorResponse =
        await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: "Profil mis à jour avec succès" });
        setIsEditingProfile(false);

        // Update NextAuth session - this will reload data from database
        if (update) {
          await update();
        }
      } else {
        const errorData = data as ProfileErrorResponse;
        setMessage({
          type: "error",
          text: errorData.error || "Erreur lors de la mise à jour",
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erreur de connexion au serveur" });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = (): void => {
    setIsEditingProfile(false);
    setProfileData({
      name: name || "",
      email: email || "",
      phone: phone || "",
      companyName: companyName || "",
    });
    setMessage({ type: "", text: "" });
  };

  return {
    profileData,
    message,
    loading,
    isEditingProfile,
    setIsEditingProfile,
    setMessage,
    handleProfileSubmit,
    handleInputChange,
    handleCancelEdit,
  };
}
