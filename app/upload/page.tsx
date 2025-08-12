import { AudioUpload } from '../../components/upload/audio-upload'

export default function UploadPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Ajouter un épisode</h1>
          <p className="mt-2 text-gray-600">
            Uploadez votre fichier audio et ajoutez les métadonnées de base
          </p>
        </div>
        
        <AudioUpload />
      </div>
    </div>
  )
}
