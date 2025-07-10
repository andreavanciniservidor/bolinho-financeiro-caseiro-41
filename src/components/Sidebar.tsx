
import { 
  Home, 
  CreditCard, 
  PiggyBank, 
  BarChart3,
  Settings,
  Bell
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Transações', href: '/transactions', icon: CreditCard },
  { name: 'Orçamentos', href: '/budgets', icon: PiggyBank },
  { name: 'Relatórios', href: '/reports', icon: BarChart3 },
];

export function Sidebar() {
  return (
    <div className="flex flex-col w-64 bg-white border-r border-gray-200 h-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <PiggyBank className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-gray-900">Fin Control</h1>
            <p className="text-xs text-gray-500">Controle Financeiro</p>
          </div>
        </div>
        <Bell className="h-5 w-5 text-gray-400" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )
            }
          >
            <item.icon className="h-5 w-5" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-gray-700">U</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              Usuário
            </p>
            <p className="text-xs text-gray-500 truncate">
              usuario@exemplo.com
            </p>
          </div>
        </div>
        <div className="flex items-center mt-2 space-x-2 text-xs">
          <button className="text-gray-500 hover:text-gray-700">
            Configurações
          </button>
        </div>
      </div>
    </div>
  );
}
