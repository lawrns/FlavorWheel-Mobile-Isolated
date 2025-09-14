'use client'

import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/grid-system'

export default function PaletteTestPage() {
  return (
    <div className="min-h-screen bg-fx-bg" style={{ background: 'var(--fx-gradient-subtle)' }}>
      <Container size="xl" className="p-4 md:p-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-fx-text-primary font-heading">
              FlavorWheel México
            </h1>
            <p className="text-lg text-fx-text-secondary max-w-2xl mx-auto">
              Paleta cremosa cálida con verde agave profundo y acentos de terracota
            </p>
          </div>

          {/* Color Palette Showcase */}
          <div className="bg-fx-card rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-semibold text-fx-text-primary mb-6 font-heading">
              Paleta de Colores Mexicana
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Primary Colors */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-fx-text-primary">Colores Primarios</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-lg bg-fx-primary shadow-sm"></div>
                    <div>
                      <p className="font-medium text-fx-text-primary">Verde Agave</p>
                      <p className="text-sm text-fx-text-muted">#1F5D4C</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-lg bg-fx-secondary shadow-sm"></div>
                    <div>
                      <p className="font-medium text-fx-text-primary">Oro Mexicano</p>
                      <p className="text-sm text-fx-text-muted">#D4AF37</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-lg bg-fx-accent shadow-sm"></div>
                    <div>
                      <p className="font-medium text-fx-text-primary">Terracota</p>
                      <p className="text-sm text-fx-text-muted">#C65A2E</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Surface Colors */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-fx-text-primary">Superficies</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-lg bg-fx-bg border border-fx-border-default shadow-sm"></div>
                    <div>
                      <p className="font-medium text-fx-text-primary">Crema Cálida</p>
                      <p className="text-sm text-fx-text-muted">#FEF3E7</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-lg bg-fx-card border border-fx-border-default shadow-sm"></div>
                    <div>
                      <p className="font-medium text-fx-text-primary">Blanco Puro</p>
                      <p className="text-sm text-fx-text-muted">#FFFFFF</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-lg bg-fx-bg-subtle border border-fx-border-default shadow-sm"></div>
                    <div>
                      <p className="font-medium text-fx-text-primary">Crema Sutil</p>
                      <p className="text-sm text-fx-text-muted">#F7F3EA</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Text Colors */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-fx-text-primary">Texto</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-lg bg-fx-text-primary shadow-sm"></div>
                    <div>
                      <p className="font-medium text-fx-text-primary">Marrón Rico</p>
                      <p className="text-sm text-fx-text-muted">#2C1810</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-lg bg-fx-text-secondary shadow-sm"></div>
                    <div>
                      <p className="font-medium text-fx-text-primary">Gris Medio</p>
                      <p className="text-sm text-fx-text-muted">#5C5C5C</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-lg bg-fx-text-muted shadow-sm"></div>
                    <div>
                      <p className="font-medium text-fx-text-primary">Gris Claro</p>
                      <p className="text-sm text-fx-text-muted">#8B8B8B</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Button Showcase */}
          <div className="bg-fx-card rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-semibold text-fx-text-primary mb-6 font-heading">
              Componentes de Botón
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-fx-text-secondary">Primario</h3>
                <Button variant="primary" size="md">
                  Verde Agave
                </Button>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-fx-text-secondary">Secundario</h3>
                <Button variant="secondary" size="md">
                  Oro Mexicano
                </Button>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-fx-text-secondary">Acento</h3>
                <Button variant="accent" size="md">
                  Terracota
                </Button>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-fx-text-secondary">Fantasma</h3>
                <Button variant="ghost" size="md">
                  Sutil
                </Button>
              </div>
            </div>

            {/* Mobile Variants */}
            <div className="mt-8 space-y-4">
              <h3 className="text-lg font-medium text-fx-text-primary">Variantes Móviles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="primary" size="lg">
                  Estilo Mexicano Outdoor
                </Button>
                <Button variant="accent" size="xl">
                  Optimizado para Sol
                </Button>
              </div>
            </div>
          </div>

          {/* Typography Showcase */}
          <div className="bg-fx-card rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-semibold text-fx-text-primary mb-6 font-heading">
              Tipografía
            </h2>
            
            <div className="space-y-4">
              <div>
                <h1 className="text-4xl font-bold text-fx-text-primary font-heading">
                  Crimson Text - Encabezados
                </h1>
                <p className="text-sm text-fx-text-muted">Serif elegante para títulos</p>
              </div>
              
              <div>
                <p className="text-lg text-fx-text-primary font-body">
                  Inter - Texto del cuerpo para máxima legibilidad en dispositivos móviles
                </p>
                <p className="text-sm text-fx-text-muted">Sans-serif optimizada para pantallas</p>
              </div>
              
              <div>
                <p className="text-fx-text-secondary">
                  Texto secundario con contraste mejorado para cumplir WCAG AA
                </p>
              </div>
              
              <div>
                <p className="text-fx-text-muted">
                  Texto silenciado para información complementaria
                </p>
              </div>
            </div>
          </div>

          {/* Cards Showcase */}
          <div className="bg-fx-card rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-semibold text-fx-text-primary mb-6 font-heading">
              Tarjetas y Superficies
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-fx-elevated rounded-lg p-4 shadow-md border border-fx-border-subtle">
                <h3 className="text-lg font-semibold text-fx-text-primary mb-2">
                  Superficie Elevada
                </h3>
                <p className="text-fx-text-secondary">
                  Tarjeta con sombra sutil y bordes suaves sobre fondo crema cálido
                </p>
              </div>
              
              <div className="bg-fx-bg-subtle rounded-lg p-4 border border-fx-border-default">
                <h3 className="text-lg font-semibold text-fx-text-primary mb-2">
                  Superficie Sutil
                </h3>
                <p className="text-fx-text-secondary">
                  Variación de superficie con contraste mínimo para contenido secundario
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}
