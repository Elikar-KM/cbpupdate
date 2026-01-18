// Next Imports

// MUI Imports
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'

// Type Imports
import { useSession } from 'next-auth/react'

import type { getDictionary } from '@/utils/getDictionary'
import type { VerticalMenuContextProps } from '@menu/components/vertical-menu/Menu'

// Component Imports
import { Menu, MenuItem, SubMenu } from '@menu/vertical-menu'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

// Styled Component Imports
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'

// Menu Data Imports
import menuData from '@/data/navigation/verticalMenuData'

type RenderExpandIconProps = {
  open?: boolean
  transitionDuration?: VerticalMenuContextProps['transitionDuration']
}

type Props = {
  dictionary: Awaited<ReturnType<typeof getDictionary>>
  scrollMenu: (container: any, isPerfectScrollbar: boolean) => void
  effectiveRole?: string | null
}

const RenderExpandIcon = ({ open, transitionDuration }: RenderExpandIconProps) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='tabler-chevron-right' />
  </StyledVerticalNavExpandIcon>
)

const VerticalMenu = ({ dictionary, scrollMenu, effectiveRole }: Props) => {
  // Hooks
  const theme = useTheme()
  const verticalNavOptions = useVerticalNav()
  const { data: session } = useSession()

  // Vars
  const { isBreakpointReached, transitionDuration } = verticalNavOptions

  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  // Get user role - use effectiveRole if impersonating, otherwise use session role
  const userRole = effectiveRole || session?.user?.role || 'investor'

  // Get menu data based on user role
  const menu = menuData(dictionary, userRole)

  const renderMenuItem = (item: any, index: number) => {
    if (item.children) {
      // Render SubMenu
      return (
        <SubMenu key={index} label={item.label} icon={<i className={item.icon} />}>
          {item.children.map((child: any, childIndex: number) => (
            <MenuItem key={childIndex} href={`${child.href}`} icon={<i className={child.icon} />}>
              {child.label}
            </MenuItem>
          ))}
        </SubMenu>
      )
    } else {
      // Render MenuItem
      return (
        <MenuItem key={index} href={`${item.href}`} icon={<i className={item.icon} />}>
          {item.label}
        </MenuItem>
      )
    }
  }

  return (
    <ScrollWrapper
      {...(isBreakpointReached
        ? {
            className: 'bs-full overflow-y-auto overflow-x-hidden',
            onScroll: container => scrollMenu(container, false)
          }
        : {
            options: { wheelPropagation: false, suppressScrollX: true },
            onScrollY: container => scrollMenu(container, true)
          })}
    >
      <Menu
        popoutMenuOffset={{ mainAxis: 23 }}
        menuItemStyles={menuItemStyles(verticalNavOptions, theme)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className='tabler-circle text-xs' /> }}
        menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
      >
        {menu.map((item, index) => renderMenuItem(item, index))}
      </Menu>
    </ScrollWrapper>
  )
}

export default VerticalMenu
