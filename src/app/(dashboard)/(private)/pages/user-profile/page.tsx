// React Imports
import type { ReactElement } from 'react'

// Next Imports
import dynamic from 'next/dynamic'

// Type Imports
import type { Data } from '@/types/pages/profileTypes'

// Component Imports
import UserProfile from '@views/pages/user-profile'

// Data Imports
import { getProfileData } from '@/app/server/actions'

const ProfileTab = dynamic(() => import('@views/pages/user-profile/profile'))
const TeamsTab = dynamic(() => import('@views/pages/user-profile/teams'))
const ProjectsTab = dynamic(() => import('@views/pages/user-profile/projects'))
const ConnectionsTab = dynamic(() => import('@views/pages/user-profile/connections'))

// Vars
const tabContentList = (data?: Data): { [key: string]: ReactElement } => ({
  profile: <ProfileTab data={data?.users.profile} />,
  teams: <TeamsTab data={data?.users.teams} />,
  projects: <ProjectsTab data={data?.users.projects} />,
  connections: <ConnectionsTab data={data?.users.connections} />
})

const ProfilePage = async () => {
  // Vars
  const data = await getProfileData()

  if (!data) {
    return <div>Failed to load profile data</div>
  }

  return <UserProfile data={data} tabContentList={tabContentList(data)} />
}

export default ProfilePage
