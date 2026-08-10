// // import React, { useState, useEffect } from 'react';
// import React from 'react';
// import { NavLink, useParams } from 'react-router-dom';
// import {
//   LayoutDashboard, Users, Wallet, ArrowLeftRight, CreditCard,
//   BarChart3, MessageSquare, MessageCircle, WifiOff, Building2,
//   Settings, UserCog, ChevronLeft, ChevronRight, Landmark
// } from 'lucide-react';

// // import { useTheme } from '../../context/ThemeContext';
// import { useSelector } from 'react-redux';
// import { getInitials } from '../../utils/formatters';


// const NAV_CONFIG = [
//   {
//     group: 'Main',
//     items: [
//       {
//         label:'Dashboard',
//         icon:LayoutDashboard,
//         path:'/dashboard',
//         roles:['admin','manager']
//       }
//     ]
//   },

//   {
//     group:'Banking',
//     items:[
//       {
//         label:'Customers',
//         icon:Users,
//         path:'/customers',
//         roles:['admin','manager']
//       },
//       {
//         label:'Applications',
//         icon:Users,
//         path:'/customers/applications',
//         roles:['admin','manager']
//       },
//       {
//         label:'Accounts',
//         icon:Wallet,
//         path:'/accounts',
//         roles:['admin','manager']
//       },
//       {
//         label:'Transactions',
//         icon:ArrowLeftRight,
//         path:'/transactions',
//         roles:['admin','manager']
//       },
//       {
//         label:'Loans',
//         icon:CreditCard,
//         path:'/loans',
//         roles:['admin','manager']
//       }
//     ]
//   },


//   {
//     group:'Reports',
//     items:[
//       {
//         label:'Reports',
//         icon:BarChart3,
//         path:'/reports',
//         roles:['admin','manager']
//       }
//     ]
//   },


//   {
//     group:'Rural Features',
//     items:[
//       {
//         label:'SMS Banking',
//         icon:MessageSquare,
//         path:'/sms-banking',
//         roles:['admin','manager']
//       },
//       {
//         label:'WhatsApp Banking',
//         icon:MessageCircle,
//         path:'/whatsapp',
//         roles:['admin','manager']
//       },
//       {
//         label:'Offline Sync',
//         icon:WifiOff,
//         path:'/offline-sync',
//         roles:['admin','manager']
//       }
//     ]
//   },


//   {
//     group:'Administration',
//     items:[
//       {
//         label:'Branches',
//         icon:Building2,
//         path:'/branches',
//         roles:['admin']
//       },
//       {
//         label:'Users',
//         icon:UserCog,
//         path:'/users',
//         roles:['admin']
//       },
//       {
//         label:'Settings',
//         icon:Settings,
//         path:'/settings',
//         roles:['admin']
//       }
//     ]
//   },


//   {
//     group:'My Banking',
//     items:[
//       {
//         label:'Dashboard',
//         icon:LayoutDashboard,
//         path:'/member/dashboard',
//         roles:['member']
//       },
//       {
//         label:'My Accounts',
//         icon:Wallet,
//         path:'/member/accounts',
//         roles:['member']
//       },
//       {
//         label:'Transactions',
//         icon:ArrowLeftRight,
//         path:'/member/transactions',
//         roles:['member']
//       },
//       {
//         label:'Loans',
//         icon:CreditCard,
//         path:'/member/loans',
//         roles:['member']
//       },
//       {
//         label:'Profile',
//         icon:UserCog,
//         path:'/member/profile',
//         roles:['member']
//       }
//     ]
//   },


//   {
//     group:'Platform',
//     items:[
//       {
//         label:'Analytics',
//         icon:LayoutDashboard,
//         path:'/admin/dashboard',
//         roles:['admin']
//       },
//       {
//         label:'Cooperatives',
//         icon:Building2,
//         path:'/admin/cooperatives',
//         roles:['admin']
//       }
//     ]
//   }
// ];


// export default function Sidebar({ collapsed, onToggle }) {
//   const currentUser = useSelector((state) => state.auth.user);
//   // const { currentUser } = useAuth();
//   const branding = { logo: null, appName: "Aama Cooperatives"};
//   const location = useLocation();
//   const { cooperativeId } = useParams();
//   // const [visible, setVisible] = useState(false);

//   // useEffect(() => {
//   //   setTimeout(() => setVisible(true), 50);
//   // }, []);

//   // const getInitials = (name) =>
//   //   name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '??';

//   return (
//     <aside className={`
//         fixed left-0 top-0 z-50
//         flex h-screen flex-col
//         bg-white border-r border-gray-200 shadow-sm
//         transition-all duration-300
//         ${collapsed ? "w-20" : "w-72"}
//       `}>
//       <div className="flex h-16 items-center border-b px-4">
//         {branding.logo ? (
//           <img src={branding.logo} alt="Logo" className="sidebar-logo-icon" style={{ objectFit: 'contain' }} />
//         ) : (
//           <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
//             <Landmark size={20} className="text-white" />
//           </div>
//         )}
//         {!collapsed && (
//           <div className="ml-3 overflow-hidden">
//             <h1 className='truncate font-medium uppercase tracking-wide text-xs text-gray-500'>{currentUser?.role === 'admin' ? 'Platform Admin' : branding.appName}</h1>
//             <p className="truncate text-sm font-semibold text-gray-900">{currentUser?.role === 'admin' ? 'Platform Management' : currentUser?.role === 'member' ? 'Member Portal' : 'Banking Platform'}</p>
//           </div>
//         )}
//       </div>

//       {/* Navigation */}
//       <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin scrollbar-thumb-gray-300">
//         {NAV_CONFIG.map((group) => {
//           const visibleItems = group.items.filter(
//             item => item.roles.includes(currentUser?.role)
//           );
//           if (!visibleItems.length) return null;

//           return (
//             <div key={group.group} className="nav-group">
//               {!collapsed && (
//                         <div className="
//                           mb-2 px-3 pt-4
//                           text-xs font-semibold uppercase
//                           tracking-wide text-gray-400
//                         ">
//                           {group.group}
//                         </div>
//               )}
//               {visibleItems.map((item) => {
//                 let finalPath = item.path;
//                 if (cooperativeId && !item.path.startsWith('/member') && !item.path.startsWith('/admin')) {
//                   finalPath = `/c/${cooperativeId}${item.path}`;
//                 }

//                 return (
//                   <NavLink
//                     key={item.path}
//                     to={finalPath}
//                     className={({ isActive }) =>
//                       `flex items-center gap-3 rounded-lg px-3 py-2 mb-1
//                         text-sm transition-colors
//                         ${
//                           isActive
//                             ? "bg-blue-50 text-blue-600 font-semibold"
//                             : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
//                         }`
//                       }
//                     title={collapsed ? item.label : undefined}
//                   >
//                   <span className="flex w-5 justify-center">
//                     <item.icon size={17} />
//                   </span>
//                   {!collapsed && item.label}
//                   </NavLink>
//                 );
//               })}
//             </div>
//           );
//         })}
//       </nav>

//       {/* User + Collapse */}
//       <div className="border-t p-3">
//         {!collapsed && (
//           <div className="mb-3 flex items-center gap-3">
//             <div className='flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white'>
//               {getInitials(currentUser?.name)}
//             </div>

//             <div>

//               <p className='text-sm font-medium text-gray-800'>{currentUser?.name}</p>

//               <p className='text-xs capitalize text-gray-500'>{currentUser?.role}</p>
//             </div>

//           </div>
//         )}
//         <button
//           onClick={onToggle}
//           className="flex w-full items-center rounded-lg border border-gray-200 py-2 text-gray-600 hover:bg-gray-100"
//           // style={{ width: '100%', marginTop: collapsed ? 0 : '12px', justifyContent: collapsed ? 'center' : 'flex-end' }}
//           title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
//         >
//           <span className='mx-auto'>
//             {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
//           </span>
//         </button>
//       </div>
//     </aside>
//   );
// }





import React from "react";
import { NavLink, useParams } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Wallet,
  ArrowLeftRight,
  CreditCard,
  BarChart3,
  MessageSquare,
  Building2,
  Settings,
  UserCog,
  ChevronLeft,
  ChevronRight,
  Landmark,
  X,
  ArrowDownToLine,
  ArrowUpFromLine,
  Palette,
} from "lucide-react";

import { useSelector } from "react-redux";
import { getInitials } from "../../utils/formatters";


const NAV_CONFIG = [

  {
    group: "Main",
    items: [
      {
        label: "Dashboard",
        icon: LayoutDashboard,
        path: "/dashboard",
        roles: ["manager"]
      }
    ]
  },

  {
    group: "Banking",
    items:[
      {
        label:"Accounts",
        icon:Wallet,
        path:"/accounts",
        roles:["manager"]
      },
      {
        label:"Transactions",
        icon:ArrowLeftRight,
        path:"/transactions",
        roles:["manager"]
      },
      {
        label:"Deposits",
        icon:ArrowDownToLine,
        path:"/deposits",
        roles:["manager"]
      },
      {
        label:"Withdrawals",
        icon:ArrowUpFromLine,
        path:"/withdrawals",
        roles:["manager"]
      },
      {
        label:"Loans",
        icon:CreditCard,
        path:"/loans",
        roles:["manager"]
      }
    ]
  },


  {
    group:"Reports",
    items:[
      {
        label:"Reports",
        icon:BarChart3,
        path:"/reports",
        roles:["manager"]
      }
    ]
  },


  {
    group:"Services",
    items:[
      {
        label:"SMS Banking",
        icon:MessageSquare,
        path:"/sms-banking",
        roles:["manager"]
      }
    ]
  },


  {
    group:"Administration",
    items:[
      {
        label:"Branches",
        icon:Building2,
        path:"/branches",
        roles:["manager"]
      },
      {
        label:"Users",
        icon:UserCog,
        path:"/users",
        roles:["manager"]
      },
      {
        label:"Settings",
        icon:Settings,
        path:"/settings",
        roles:["manager"]
      },
      {
        label:"Preferences",
        icon:Palette,
        path:"/settings/preferences",
        roles:["manager"]
      },
      {
        label:"Cooperative Profile",
        icon:Building2,
        path:"/cooperative",
        roles:["manager"]
      }
    ]
  },


  {
    group:"My Banking",
    items:[
      {
        label:"Dashboard",
        icon:LayoutDashboard,
        path:"/member/dashboard",
        roles:["member"]
      },
      {
        label:"My Accounts",
        icon:Wallet,
        path:"/member/accounts",
        roles:["member"]
      },
      {
        label:"Transactions",
        icon:ArrowLeftRight,
        path:"/member/transactions",
        roles:["member"]
      },
      {
        label:"Loans",
        icon:CreditCard,
        path:"/member/loans",
        roles:["member"]
      },
      {
        label:"Profile",
        icon:UserCog,
        path:"/member/profile",
        roles:["member"]
      },
      {
        label:"Settings",
        icon:Settings,
        path:"/member/settings",
        roles:["member"]
      }
    ]
  },


  {
    group:"Platform",
    items:[
      {
        label:"Dashboard",
        icon:LayoutDashboard,
        path:"/admin/dashboard",
        roles:["admin"]
      },
      {
        label:"Cooperatives",
        icon:Building2,
        path:"/admin/cooperatives",
        roles:["admin"]
      },
      {
        label:"Users",
        icon:Users,
        path:"/admin/users",
        roles:["admin"]
      },
      {
        label:"Settings",
        icon:Settings,
        path:"/admin/settings",
        roles:["admin"]
      }
    ]
  }

];


export default function Sidebar({
  collapsed,
  onToggle,
  mobileOpen = false,
  onCloseMobile
}){


const user = useSelector(
  state=>state.auth.user
);


const {cooperativeId}=useParams();


return (

<aside
className={`
sidebar-glass
fixed left-0 top-0 z-50
h-screen border-r
flex flex-col overflow-hidden
shadow-2xl lg:shadow-none
transition-all duration-300
w-72
${collapsed ? "lg:w-20" : "lg:w-72"}
${mobileOpen ? "translate-x-0" : "-translate-x-full"}
lg:translate-x-0
`}
>


{/* Logo */}

<div className="
h-16 flex items-center
border-b px-4
">


<div className="
h-10 w-10
rounded-xl
bg-[#2A9D8F]
flex items-center justify-center
">

<Landmark
size={22}
className="text-white"
/>

</div>


{
!collapsed &&

<div className="ml-3">

<p className="
text-xs text-gray-500 uppercase
">

Aama Cooperatives

</p>


<p className="
font-semibold text-slate-800
">

{
user?.role==="member"
?"Member Portal"
:
"Banking Platform"
}

</p>


</div>

}


<button
  onClick={onCloseMobile}
  className="
    ml-auto flex h-9 w-9 items-center justify-center
    rounded-lg text-slate-500 hover:bg-[#2A9D8F]/10 hover:text-slate-700
    lg:hidden
  "
  aria-label="Close menu"
>
  <X size={20} />
</button>


</div>



{/* Navigation */}

<nav className="
flex-1 overflow-y-auto
p-3
">


{
NAV_CONFIG.map(group=>{


const items =
group.items.filter(
  item=>{
    const roleMatch =
      item.roles.includes(user?.role) ||
      (user?.role === 'admin' && item.roles.includes('manager'));
    if (!roleMatch) return false;
    if (
      user?.role === 'admin' &&
      !cooperativeId &&
      !item.path.startsWith('/admin') &&
      !item.path.startsWith('/member')
    ) {
      return false;
    }
    return true;
  }
);


if(!items.length)
return null;



return (

<div
key={group.group}
className="mb-5"
>


{
!collapsed &&
<p className="
px-3 mb-2
text-xs font-semibold
uppercase text-slate-500
">

{group.group}

</p>
}



{
items.map(item=>{


let path=item.path;


if(
cooperativeId &&
!path.startsWith("/member") &&
              !path.startsWith("/admin")
){

path=`/c/${cooperativeId}${path}`;

}



return (

<NavLink

key={item.path}

to={path}

onClick={onCloseMobile}

className={({isActive})=>

`
flex items-center gap-3
px-3 py-2 rounded-lg
text-sm mb-1

${
isActive
?
"bg-[#2A9D8F]/15 text-[#0f766e] font-semibold"
:
"text-gray-600 hover:bg-[#2A9D8F]/10 hover:text-[#0f766e]"
}

`

}

>

<item.icon size={18}/>


{
!collapsed &&
<span>
{item.label}
</span>
}


</NavLink>

)

})

}



</div>

)


})

}



</nav>



{/* User */}

<div className="
border-t p-3
">


{
!collapsed &&

<div className="
flex items-center gap-3 mb-3
">


<div className="
h-10 w-10 rounded-full
bg-[#2A9D8F] text-white
flex items-center justify-center
font-semibold
">

{
getInitials(user?.name)
}

</div>


<div>

<p className="
text-sm font-medium text-slate-800
">

{user?.name}

</p>


<p className="
text-xs text-slate-500 capitalize
">

{user?.role}

</p>


</div>


</div>

}



<button

onClick={() => {
  if (typeof window !== 'undefined' && window.innerWidth < 1024) {
    onCloseMobile && onCloseMobile();
  } else {
    onToggle();
  }
}}

className="
w-full border border-slate-200 text-slate-600 rounded-lg
py-2 hover:bg-[#2A9D8F]/10
flex justify-center
"
>



{
collapsed
?
<ChevronRight size={18}/>
:
<ChevronLeft size={18}/>
}


</button>


</div>



</aside>


)

}