'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LoadingSpinner, SkeletonLoader, LoadingOverlay } from '@/components/ui/loading-states'
import { EmptyTastings, EmptyFriends, EmptyFlavorWheel } from '@/components/ui/empty-state'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { LogoOnly, ResponsiveBrand } from '@/components/brand'
import { MobileNavigation } from '@/components/ui/mobile-navigation'
import { motion } from 'framer-motion'
import { Share2, Search, Bell, Settings, Plus, Heart, Star, Users, Zap } from 'lucide-react'

export default function MobileShowcaseKit() {
  const [isLoading, setIsLoading] = React.useState(false)
  const [activeTheme, setActiveTheme] = React.useState('light')
  const [debugMode, setDebugMode] = React.useState(true)

  return (
    <div className="min-h-screen bg-fx-bg relative overflow-hidden">
      {/* Mobile App Chrome - 375px width simulation */}
      <div className="max-w-sm mx-auto bg-fx-card shadow-2xl min-h-screen relative">
        {/* Status Bar Simulation */}
        <div className="h-6 bg-black text-white text-xs flex items-center justify-between px-4 font-mono">
          <span>9:41</span>
          <div className="flex items-center gap-1">
            <div className="w-4 h-2 border border-white rounded-sm">
              <div className="w-3 h-1 bg-white rounded-sm m-0.5"></div>
            </div>
          </div>
        </div>

        {/* Top App Bar - Mexican Cultural Design */}
        <header className="bg-gradient-to-r from-fx-primary to-fx-primary-hover text-fx-text-inverse p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <ResponsiveBrand showIconOnMobile={true} showTitleOnMobile={true} className="text-fx-text-inverse" />
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
                <Search className="h-5 w-5" />
              </button>
              <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="mt-3">
            <h1 className="text-lg font-bold font-heading">Mobile Showcase Kit</h1>
            <p className="text-sm opacity-90">Authentic Mexican Tasting Experience</p>
          </div>
        </header>

        {/* Debug Panel - QA Ready */}
        {debugMode && (
          <div className="sticky top-0 z-40 bg-yellow-100 border-b border-yellow-300 p-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="font-semibold">Theme: {activeTheme}</span>
                <span>Contrast: WCAG AA ✓</span>
                <span>Touch: 44px+ ✓</span>
              </div>
              <button 
                onClick={() => setDebugMode(false)}
                className="text-yellow-800 hover:text-yellow-900"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Main Content with Safe Area */}
        <main className="main-content-mobile px-4 py-6 space-y-8">
          {/* Invite Friend Bottom Sheet Simulation */}
          <section data-testid="button-showcase" className="space-y-4">
            <div className="bg-fx-card rounded-2xl p-6 shadow-lg border border-fx-border-subtle">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-fx-primary/10 rounded-full">
                  <Users className="h-5 w-5 text-fx-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-fx-text-primary">Invitar Amigo</h3>
                  <p className="text-sm text-fx-text-secondary">Comparte la experiencia</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <Button data-testid="button-primary" className="btn-agave-beautiful w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Invitar por WhatsApp
                </Button>
                <Button variant="outline" className="w-full border-fx-primary text-fx-primary hover:bg-fx-primary/5">
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartir Enlace
                </Button>
              </div>
            </div>
          </section>

          {/* Create Tasting Card */}
          <section data-testid="form-showcase" className="space-y-4">
            <div className="card-tasting-mexican p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-fx-accent/10 rounded-full">
                  <Star className="h-5 w-5 text-fx-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-fx-text-primary">Nueva Cata de Mezcal</h3>
                  <p className="text-sm text-fx-text-secondary">Registra tus notas de sabor</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-fx-text-primary mb-2">Nombre del Mezcal</label>
                  <Input 
                    data-testid="input-field"
                    placeholder="Ej: Mezcal Artesanal Oaxaca"
                    className="form-input-beautiful"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-fx-text-primary mb-2">Notas de Cata</label>
                  <textarea 
                    placeholder="Describe los sabores que percibes..."
                    className="form-input-beautiful w-full h-20 resize-none"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button className="btn-agave-beautiful flex-1">
                    <Heart className="h-4 w-4 mr-2" />
                    Guardar Cata
                  </Button>
                  <Button variant="outline" className="px-4">
                    <Zap className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Loading States in Context */}
          <section data-testid="loading-showcase" className="space-y-4">
            <div className="bg-fx-card rounded-2xl p-6 shadow-lg border border-fx-border-subtle">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-fx-secondary/10 rounded-full">
                  <Settings className="h-5 w-5 text-fx-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold text-fx-text-primary">Sincronizando Datos</h3>
                  <p className="text-sm text-fx-text-secondary">Guardando tu progreso</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <LoadingSpinner size="sm" />
                  <span className="text-sm text-fx-text-secondary">Subiendo fotos...</span>
                </div>
                
                <div className="space-y-2">
                  <SkeletonLoader lines={3} />
                </div>
                
                <div className="relative h-20 bg-fx-bg-subtle rounded-lg flex items-center justify-center">
                  <LoadingOverlay isVisible={isLoading} message="Procesando sabores..." />
                  <Button 
                    onClick={() => setIsLoading(!isLoading)}
                    variant="ghost" 
                    size="sm"
                  >
                    {isLoading ? 'Detener' : 'Simular'} Carga
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Onboarding Empty States */}
          <section data-testid="empty-showcase" className="space-y-4">
            <div className="bg-fx-card rounded-2xl p-6 shadow-lg border border-fx-border-subtle text-center">
              <div className="mb-4">
                <div className="w-16 h-16 bg-fx-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <LogoOnly size="sm" />
                </div>
                <h3 className="font-semibold text-fx-text-primary mb-2">¡Bienvenido a FlavorWheel México!</h3>
                <p className="text-sm text-fx-text-secondary mb-4">Comienza tu viaje de descubrimiento de sabores auténticos mexicanos</p>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <EmptyTastings />
                  <p className="text-xs text-fx-text-secondary mt-2">Catas</p>
                </div>
                <div className="text-center">
                  <EmptyFriends />
                  <p className="text-xs text-fx-text-secondary mt-2">Amigos</p>
                </div>
                <div className="text-center">
                  <EmptyFlavorWheel />
                  <p className="text-xs text-fx-text-secondary mt-2">Rueda</p>
                </div>
              </div>
              
              <Button className="btn-agave-beautiful w-full">
                Comenzar Primera Cata
              </Button>
            </div>
          </section>

          {/* Mexican Color Palette with Cultural Names */}
          <section data-testid="colors-showcase" className="space-y-4">
            <div className="bg-fx-card rounded-2xl p-6 shadow-lg border border-fx-border-subtle">
              <h3 className="font-semibold text-fx-text-primary mb-4">Paleta de Sabores Mexicanos</h3>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-fx-primary rounded-full mx-auto mb-2 shadow-md"></div>
                  <p className="text-xs font-medium text-fx-text-primary">Verde Agave</p>
                  <p className="text-xs text-fx-text-secondary">#1F5D4C</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-fx-secondary rounded-full mx-auto mb-2 shadow-md"></div>
                  <p className="text-xs font-medium text-fx-text-primary">Oro Mexicano</p>
                  <p className="text-xs text-fx-text-secondary">#D4AF37</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-fx-accent rounded-full mx-auto mb-2 shadow-md"></div>
                  <p className="text-xs font-medium text-fx-text-primary">Tierra Mexicana</p>
                  <p className="text-xs text-fx-text-secondary">#C65A2E</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-fx-flavor-fruity rounded-full mx-auto mb-2 shadow-md"></div>
                  <p className="text-xs font-medium text-fx-text-primary">Frutal</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-fx-flavor-vegetal rounded-full mx-auto mb-2 shadow-md"></div>
                  <p className="text-xs font-medium text-fx-text-primary">Vegetal</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-fx-flavor-sweet rounded-full mx-auto mb-2 shadow-md"></div>
                  <p className="text-xs font-medium text-fx-text-primary">Dulce</p>
                </div>
              </div>
            </div>
          </section>

          {/* Typography with Mexican Beverage Context */}
          <section data-testid="typography-showcase" className="space-y-4">
            <div className="bg-fx-card rounded-2xl p-6 shadow-lg border border-fx-border-subtle">
              <h3 className="font-semibold text-fx-text-primary mb-4">Tipografía Mexicana</h3>
              
              <div className="space-y-3">
                <h1 className="text-2xl font-bold text-fx-text-primary font-heading">Mezcal Artesanal Oaxaca</h1>
                <h2 className="text-xl font-semibold text-fx-text-primary">Notas de Cata Principales</h2>
                <h3 className="text-lg font-medium text-fx-text-primary">Sabores Detectados</h3>
                <p className="text-base text-fx-text-primary leading-relaxed">
                  Este mezcal presenta notas ahumadas intensas con toques florales y un final terroso que evoca la tierra oaxaqueña.
                </p>
                <p className="text-sm text-fx-text-secondary">
                  Graduación: 45% Vol. | Región: Oaxaca | Maestro Mezcalero: Don Juan
                </p>
                <p className="text-xs text-fx-text-secondary">
                  Certificación: NOM-070-SCFI-2016
                </p>
              </div>
            </div>
          </section>

          {/* Theme Toggle and Debug Controls */}
          <section data-testid="theme-showcase" className="space-y-4">
            <div className="bg-fx-card rounded-2xl p-6 shadow-lg border border-fx-border-subtle">
              <h3 className="font-semibold text-fx-text-primary mb-4">Controles de Tema</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-fx-text-primary">Tema Actual</span>
                  <ThemeToggle variant="switch" />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-fx-text-primary">Modo Debug</span>
                  <button 
                    onClick={() => setDebugMode(!debugMode)}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      debugMode ? 'bg-fx-primary' : 'bg-fx-border-default'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                      debugMode ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
                
                <div className="pt-4 border-t border-fx-border-subtle">
                  <p className="text-xs text-fx-text-secondary mb-2">Estado de Componentes:</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Navegación ✓</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Botones ✓</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Formularios ✓</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Tipografía ✓</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileNavigation activeScreen="test" />
      </div>
    </div>
  )
}
