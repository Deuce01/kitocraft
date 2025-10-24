'use client'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-100 py-8 mt-16">
      <div className="container mx-auto px-4 text-center text-gray-600">
        <p>&copy; {currentYear} KitoCraft 3D Printing. All rights reserved.</p>
      </div>
    </footer>
  )
}