'use client'

import { Sparkles, Plus, MessageCircle, Target, ChevronRight, Star, Trophy, Zap, BarChart3 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function LandingPage() {
  const router = useRouter()

  // Enhanced metrics for overview
  const metrics = {
    tastings: 127,
    reviews: 89,
    wheels: 23
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' }
    }
  }

  return (
    <div
      className="overflow-x-hidden relative"
      style={{
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'none',
        backgroundImage: 'url(/images/JPEG BG TRY.jpeg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh'
      }}
    >
      {/* Enhanced overlay for better readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/40"></div>

      <motion.main
        className="relative z-10 px-6 py-12 max-w-[768px] mx-auto min-h-screen"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Hero Section */}
        <motion.section
          className="text-center mb-16"
          variants={itemVariants}
        >
          <motion.h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 font-heading tracking-tight drop-shadow-lg"
            style={{ fontFamily: "'Playfair Display', ui-serif, Georgia, serif" }}
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Discover the Art of
            <span className="block text-fx-primary">Flavor Exploration</span>
          </motion.h1>

          <motion.p
            className="text-xl text-white/90 font-body max-w-2xl mx-auto leading-relaxed drop-shadow-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            The world's most user-friendly tasting experience. Create, explore, and share your flavor journey with confidence.
          </motion.p>
        </motion.section>

        {/* Feature Cards */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
          variants={containerVariants}
        >
          {[
            {
              icon: Zap,
              title: 'Quick Taste',
              description: 'Fast, intuitive flavor evaluation',
              route: '/quick-tasting',
              color: 'from-blue-500/20 to-blue-600/10',
              iconBg: 'bg-gradient-to-br from-blue-100 to-blue-200',
              iconColor: 'text-blue-700',
              borderColor: 'border-blue-200/50'
            },
            {
              icon: Plus,
              title: 'Create Tasting',
              description: 'Build comprehensive tasting sessions',
              route: '/create',
              color: 'from-purple-500/20 to-purple-600/10',
              iconBg: 'bg-gradient-to-br from-purple-100 to-purple-200',
              iconColor: 'text-purple-700',
              borderColor: 'border-purple-200/50'
            },
            {
              icon: Star,
              title: 'Write Reviews',
              description: 'Share your tasting experiences',
              route: '/review',
              color: 'from-yellow-500/20 to-yellow-600/10',
              iconBg: 'bg-gradient-to-br from-yellow-100 to-yellow-200',
              iconColor: 'text-yellow-700',
              borderColor: 'border-yellow-200/50'
            },
            {
              icon: Target,
              title: 'Flavor Wheels',
              description: 'Explore detailed flavor profiles',
              route: '/wheels',
              color: 'from-green-500/20 to-green-600/10',
              iconBg: 'bg-gradient-to-br from-green-100 to-green-200',
              iconColor: 'text-green-700',
              borderColor: 'border-green-200/50'
            }
          ].map((feature, index) => (
            <motion.button
              key={feature.title}
              onClick={() => router.push(feature.route)}
              className={`bg-gradient-to-br ${feature.color} backdrop-blur-sm border ${feature.borderColor} rounded-xl p-6 text-left hover:shadow-xl hover:shadow-black/20 transition-all duration-300 group overflow-hidden`}
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
            >
              {/* Background glow effect */}
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>

              <div className="relative z-10">
                {/* Icon */}
                <motion.div
                  className={`w-14 h-14 ${feature.iconBg} rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  whileHover={{ rotate: 10 }}
                >
                  <feature.icon className={`h-7 w-7 ${feature.iconColor}`} />
                </motion.div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-white mb-2 font-heading group-hover:text-white transition-colors">
                  {feature.title}
                </h3>
                <p className="text-white/80 font-body text-sm leading-relaxed">
                  {feature.description}
                </p>

                {/* Subtle accent line */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </motion.button>
          ))}
        </motion.div>

        {/* Statistics Section */}
        <motion.section
          className="mb-16"
          variants={itemVariants}
        >
          <motion.div
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
          >
            <motion.h2
              className="text-2xl font-semibold text-white text-center mb-8 font-heading"
              style={{ fontFamily: "'Playfair Display', ui-serif, Georgia, serif" }}
            >
              Your Tasting Journey
            </motion.h2>

            <motion.div
              className="grid grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0 }}
            >
              {[
                { value: metrics.tastings, label: 'Tastings', icon: BarChart3 },
                { value: metrics.reviews, label: 'Reviews', icon: Star },
                { value: metrics.wheels, label: 'Wheels', icon: Target }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="text-center group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 + index * 0.1 }}
                >
                  <motion.div
                    className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-white/30 transition-colors"
                    whileHover={{ scale: 1.1 }}
                  >
                    <stat.icon className="h-6 w-6 text-white" />
                  </motion.div>
                  <div className="text-3xl font-bold text-white mb-1 font-heading">
                    {stat.value}
                  </div>
                  <div className="text-white/80 font-body text-sm">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.section>

        {/* Call to Action */}
        <motion.section
          className="text-center pb-24"
          variants={itemVariants}
        >
          <motion.button
            onClick={() => router.push('/create')}
            className="px-12 py-4 bg-fx-primary text-white rounded-xl font-semibold text-xl hover:bg-fx-primaryHover disabled:opacity-50 transition-all duration-200 btn-primary shadow-xl hover:shadow-2xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
          >
            Start Your Tasting Journey
          </motion.button>

          <motion.p
            className="text-white/70 font-body mt-4 max-w-md mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            Join thousands of flavor enthusiasts in discovering the perfect taste experience
          </motion.p>
        </motion.section>
      </motion.main>
    </div>
  )
}
