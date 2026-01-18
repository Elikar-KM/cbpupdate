import axios from '@/libs/axios';

export const userService = {
  // Récupérer le profil de l'utilisateur connecté
  getProfile: async () => {
    const response = await axios.get('/me/profile');
    return response.data;
  },

  // Récupérer la liste des utilisateurs (Admin)
  getUsers: async () => {
    const response = await axios.get('/users');
    return response.data;
  },

  // Mettre à jour le profil
  updateProfile: async (data: any) => {
    const response = await axios.put('/me/profile', data);
    return response.data;
  }
};
