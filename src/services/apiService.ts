import api from './authService'

// Types
export interface UserData {
  [key: string]: any
}

export const fileService = {
  createFolder: async (folderName: string, parentId?: string) => {
    const response = await api.post('/file-manager/create-folder', {
      name: folderName,
      parentId
    })

    return response.data
  },

  uploadFile: async (formData: FormData) => {
    const response = await api.post('/file-manager/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    return response.data
  },

  getFiles: async (folderId?: string) => {
    const response = await api.get('/file-manager/files', {
      params: { folderId }
    })

    return response.data
  }
}

export const userService = {
  getUserData: async () => {
    try {
      const response = await api.get('/admin/users')
      const data = response.data

      return Array.isArray(data) ? data : data.data || []
    } catch (error) {
      console.error('Error fetching users:', error)

      return []
    }
  },

  getProfileData: async () => {
    try {
      const response = await api.post('/user-profile')
      const responseData = response.data

      if (!responseData || !responseData.data) return null

      const user = responseData.data
      const stats = user.statistics || { tasks: 0, connections: 0, projects: 0 }

      // Map API data to Profile Page Data structure (Client-side mapping)
      return {
        users: {
          profile: {
            about: [
              { property: 'Full Name', value: user.fullName || 'N/A', icon: 'tabler-user' },
              { property: 'Status', value: user.status === 'active' ? 'Active' : 'Inactive', icon: 'tabler-check' },
              { property: 'Role', value: user.role || 'User', icon: 'tabler-crown' },
              { property: 'Username', value: user.username || 'N/A', icon: 'tabler-at' }
            ],
            contacts: [
              { property: 'Contact', value: user.phone || 'Non renseigné', icon: 'tabler-phone-call' },
              { property: 'Email', value: user.email || 'N/A', icon: 'tabler-mail' }
            ],
            overview: [
              { property: 'Transactions', value: stats.tasks.toString(), icon: 'tabler-check' },
              { property: 'Connexions', value: stats.connections.toString(), icon: 'tabler-users' },
              { property: 'Investissements', value: stats.projects.toString(), icon: 'tabler-chart-line' }
            ],
            referralCode: user.sku_user || '',
            teams: [],
            teamsTech: [],
            connections: [],
            projectTable: []
          },
          teams: [],
          projects: [],
          connections: []
        },
        profileHeader: {
          fullName: user.fullName || 'Utilisateur',
          coverImg: '/images/pages/profile-banner.png',
          location: 'RDC',
          profileImg: responseData.userAvatar || '/images/avatars/1.png',
          joiningDate: user.created_at
            ? new Date(user.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
            : '',
          designation: user.role || 'Utilisateur'
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error)

      return null
    }
  },

  getPricingData: async () => {
    try {
      const response = await api.get('/package')
      const responseData = response.data
      const packages = responseData.data || []

      return packages.map((pkg: any) => ({
        title: pkg.name,
        imgSrc: '/images/icons/pot-1.png',
        subtitle: `ROI: ${pkg.roi_min}% - ${pkg.roi_max}%`,
        imgWidth: 100,
        imgHeight: 100,
        currentPlan: false,
        popularPlan: false,
        monthlyPrice: pkg.amount_min,
        planBenefits: [
          `Montant Min: ${pkg.amount_min} $`,
          `Montant Max: ${pkg.amount_max} $`,
          `Durée: ${pkg.duration} jours`,
          `ROI Min: ${pkg.roi_min}%`,
          `ROI Max: ${pkg.roi_max}%`
        ],
        yearlyPlan: {
          monthly: pkg.amount_min,
          annually: pkg.amount_min * 12
        }
      }))
    } catch (error) {
      console.error('Error fetching pricing:', error)

      return []
    }
  },

  getFaqData: async () => {
    // Static French FAQ Data (Same as server actions)
    return [
      {
        id: 'payment',
        title: 'Paiement',
        subtitle: 'Tout sur les paiements',
        icon: 'tabler-credit-card',
        questionsAnswers: [
          {
            id: 'payment-1',
            question: 'Quels sont les modes de paiement acceptés ?',
            answer:
              'Nous acceptons les paiements par crypto-monnaies (USDT, BTC, ETH) et par virement bancaire selon votre région.'
          },
          {
            id: 'payment-2',
            question: 'Comment effectuer un retrait ?',
            answer:
              'Vous pouvez demander un retrait depuis votre tableau de bord dans la section "Retrait". Les fonds seront envoyés vers votre portefeuille configuré.'
          }
        ]
      },
      {
        id: 'account',
        title: 'Compte',
        subtitle: 'Gestion de votre compte',
        icon: 'tabler-user',
        questionsAnswers: [
          {
            id: 'account-1',
            question: 'Comment changer mon mot de passe ?',
            answer: 'Allez dans "Paramètres" puis "Sécurité" pour modifier votre mot de passe.'
          },
          {
            id: 'account-2',
            question: 'Puis-je avoir plusieurs comptes ?',
            answer: "Non, conformément à nos conditions d'utilisation, un seul compte par personne est autorisé."
          }
        ]
      },
      {
        id: 'investment',
        title: 'Investissement',
        subtitle: 'Questions sur les investissements',
        icon: 'tabler-chart-bar',
        questionsAnswers: [
          {
            id: 'inv-1',
            question: 'Quand les intérêts sont-ils versés ?',
            answer: 'Les intérêts sont calculés et versés quotidiennement sur votre solde disponible.'
          },
          {
            id: 'inv-2',
            question: "Quel est le montant minimum d'investissement ?",
            answer:
              'Le montant minimum dépend du package choisi. Veuillez consulter la page "Tarifs" pour plus de détails.'
          }
        ]
      }
    ]
  },

  getStatistics: async () => {
    try {
      const response = await api.get('/user/statistics')

      return response.data
    } catch (error) {
      console.error('Error fetching statistics:', error)

      return null
    }
  },

  getInvoiceData: async () => {
    return []
  }
}

// Re-export specific functions for easier migration if needed,
// though direct usage of userService.method is preferred.
export const getUserData = userService.getUserData
export const getProfileData = userService.getProfileData
export const getPricingData = userService.getPricingData
export const getFaqData = userService.getFaqData
export const getInvoiceData = userService.getInvoiceData
