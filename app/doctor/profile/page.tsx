'use client';

import { useState } from 'react';
import { useAuth, useAuthStore } from '@/hooks/useAuth';
import PageHeader from '@/components/shared/PageHeader';
import {
  Mail,
  Phone,
  Stethoscope,
  MapPin,
  Briefcase,
  IndianRupee,
  Building,
  GraduationCap,
  Pencil,
  Loader2,
  Check,
  X,
  Globe,
  FileText,
} from 'lucide-react';
import { formatCurrency, SPECIALIZATIONS, LANGUAGES, CITIES } from '@/lib/utils';

interface ProfileFormData {
  name: string;
  phone: string;
  specialization: string;
  qualifications: string;
  experience: string;
  consultationFee: string;
  clinicName: string;
  city: string;
  address: string;
  about: string;
  languages: string[];
}

export default function DoctorProfilePage() {
  const { user, doctorProfile, fetchWithAuth } = useAuth();
  const setAuth = useAuthStore((s) => s.setAuth);
  const accessToken = useAuthStore((s) => s.accessToken);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState<ProfileFormData>({
    name: '',
    phone: '',
    specialization: '',
    qualifications: '',
    experience: '',
    consultationFee: '',
    clinicName: '',
    city: '',
    address: '',
    about: '',
    languages: [],
  });

  const startEditing = () => {
    setForm({
      name: user?.name || '',
      phone: user?.phone || '',
      specialization: doctorProfile?.specialization || '',
      qualifications: doctorProfile?.qualifications?.join(', ') || '',
      experience: String(doctorProfile?.experience || 0),
      consultationFee: String(doctorProfile?.consultationFee || 0),
      clinicName: doctorProfile?.clinicName || '',
      city: doctorProfile?.city || '',
      address: doctorProfile?.address || '',
      about: doctorProfile?.about || '',
      languages: doctorProfile?.languages || [],
    });
    setError('');
    setSuccess('');
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setError('');
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const toggleLanguage = (lang: string) => {
    setForm((p) => ({
      ...p,
      languages: p.languages.includes(lang)
        ? p.languages.filter((l) => l !== lang)
        : [...p.languages, lang],
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSaving(true);

    try {
      const res = await fetchWithAuth('/api/doctors/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          specialization: form.specialization,
          qualifications: form.qualifications
            .split(',')
            .map((q) => q.trim())
            .filter(Boolean),
          experience: Number(form.experience),
          consultationFee: Number(form.consultationFee),
          clinicName: form.clinicName,
          city: form.city,
          address: form.address,
          about: form.about,
          languages: form.languages,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to update profile');
      }

      // Update auth store with new user + doctorProfile data
      if (data.data?.user && accessToken) {
        setAuth(data.data.user, accessToken, data.data.doctorProfile);
      }

      setSuccess('Profile updated successfully!');
      setIsEditing(false);

      // Clear success message after 3s
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setIsSaving(false);
    }
  };

  // ── View Mode ──────────────────────────────────────────
  if (!isEditing) {
    return (
      <div className="animate-fade-in">
        <PageHeader title="My Profile" description="View and manage your doctor profile" />
        <div className="max-w-3xl">
          {/* Success toast */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 flex items-center gap-2 animate-fade-in">
              <Check className="w-4 h-4" />
              {success}
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm">
            {/* Header banner */}
            <div className="h-32 gradient-primary relative">
              <div className="absolute -bottom-12 left-8">
                <div className="w-24 h-24 rounded-2xl bg-white border-4 border-white shadow-lg flex items-center justify-center gradient-primary text-white text-3xl font-bold">
                  {user?.name?.[0]?.toUpperCase() || 'D'}
                </div>
              </div>
              {/* Edit button */}
              <button
                id="edit-profile-btn"
                onClick={startEditing}
                className="absolute top-4 right-4 inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-sm font-medium rounded-xl transition-all border border-white/20 hover:border-white/40 active:scale-95"
              >
                <Pencil className="w-4 h-4" />
                Edit Profile
              </button>
            </div>

            {/* Profile info */}
            <div className="pt-16 pb-8 px-8">
              <h2 className="text-2xl font-bold text-slate-900">Dr. {user?.name}</h2>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 text-primary-700 text-sm font-medium rounded-full">
                  <Stethoscope className="w-3.5 h-3.5" />
                  {doctorProfile?.specialization || 'Specialist'}
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full ${
                    doctorProfile?.status === 'approved'
                      ? 'bg-green-50 text-green-700'
                      : doctorProfile?.status === 'rejected'
                      ? 'bg-red-50 text-red-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {doctorProfile?.status || 'pending'}
                </span>
              </div>

              {/* Info grid */}
              <div className="mt-8 grid sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                  <Mail className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-400">Email</p>
                    <p className="text-sm font-medium text-slate-900">{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                  <Phone className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-400">Phone</p>
                    <p className="text-sm font-medium text-slate-900">{user?.phone || 'Not set'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                  <Briefcase className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-400">Experience</p>
                    <p className="text-sm font-medium text-slate-900">
                      {doctorProfile?.experience || 0} years
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                  <IndianRupee className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-400">Consultation Fee</p>
                    <p className="text-sm font-medium text-slate-900">
                      {doctorProfile?.consultationFee
                        ? formatCurrency(doctorProfile.consultationFee)
                        : '—'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                  <Building className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-400">Clinic</p>
                    <p className="text-sm font-medium text-slate-900">
                      {doctorProfile?.clinicName || '—'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                  <MapPin className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-400">City</p>
                    <p className="text-sm font-medium text-slate-900">
                      {doctorProfile?.city || '—'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl sm:col-span-2">
                  <MapPin className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-400">Address</p>
                    <p className="text-sm font-medium text-slate-900">
                      {doctorProfile?.address || '—'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Qualifications */}
              {doctorProfile?.qualifications && doctorProfile.qualifications.length > 0 && (
                <div className="mt-6 p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <GraduationCap className="w-4 h-4 text-slate-400" />
                    <p className="text-xs text-slate-400">Qualifications</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {doctorProfile.qualifications.map((q, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-primary-50 text-primary-700 text-sm font-medium rounded-lg"
                      >
                        {q}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Languages */}
              {doctorProfile?.languages && doctorProfile.languages.length > 0 && (
                <div className="mt-4 p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-4 h-4 text-slate-400" />
                    <p className="text-xs text-slate-400">Languages</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {doctorProfile.languages.map((lang, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* About */}
              {doctorProfile?.about && (
                <div className="mt-4 p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <p className="text-xs text-slate-400">About</p>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">{doctorProfile.about}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Edit Mode ──────────────────────────────────────────
  return (
    <div className="animate-fade-in">
      <PageHeader title="Edit Profile" description="Update your professional details" />
      <div className="max-w-3xl">
        <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm">
          <div className="h-20 gradient-primary relative">
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <button
                type="button"
                onClick={cancelEditing}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-sm font-medium rounded-xl transition-all border border-white/20 hover:border-white/40 active:scale-95"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </div>

          <form onSubmit={handleSave} className="p-8 space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 animate-fade-in">
                {error}
              </div>
            )}

            {/* Personal Info Section */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                Personal Information
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit-name" className="block text-sm font-medium text-slate-700 mb-2">
                    Full Name
                  </label>
                  <input
                    id="edit-name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    required
                    minLength={2}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="edit-phone" className="block text-sm font-medium text-slate-700 mb-2">
                    Phone
                  </label>
                  <input
                    id="edit-phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Professional Info Section */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                  <Stethoscope className="w-4 h-4 text-white" />
                </div>
                Professional Details
              </h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="edit-specialization" className="block text-sm font-medium text-slate-700 mb-2">
                    Specialization
                  </label>
                  <select
                    id="edit-specialization"
                    name="specialization"
                    value={form.specialization}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none transition-all"
                  >
                    <option value="">Select specialization</option>
                    {SPECIALIZATIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="edit-qualifications" className="block text-sm font-medium text-slate-700 mb-2">
                    Qualifications
                  </label>
                  <input
                    id="edit-qualifications"
                    name="qualifications"
                    type="text"
                    value={form.qualifications}
                    onChange={handleChange}
                    placeholder="MBBS, MD (comma-separated)"
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="edit-experience" className="block text-sm font-medium text-slate-700 mb-2">
                      Experience (years)
                    </label>
                    <input
                      id="edit-experience"
                      name="experience"
                      type="number"
                      min={0}
                      max={60}
                      value={form.experience}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-fee" className="block text-sm font-medium text-slate-700 mb-2">
                      Consultation Fee (₹)
                    </label>
                    <input
                      id="edit-fee"
                      name="consultationFee"
                      type="number"
                      min={100}
                      max={10000}
                      value={form.consultationFee}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Clinic Info Section */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                  <Building className="w-4 h-4 text-white" />
                </div>
                Clinic Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="edit-clinic" className="block text-sm font-medium text-slate-700 mb-2">
                    Clinic Name
                  </label>
                  <input
                    id="edit-clinic"
                    name="clinicName"
                    type="text"
                    value={form.clinicName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="edit-city" className="block text-sm font-medium text-slate-700 mb-2">
                      City
                    </label>
                    <select
                      id="edit-city"
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none transition-all"
                    >
                      <option value="">Select city</option>
                      {CITIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="edit-address" className="block text-sm font-medium text-slate-700 mb-2">
                      Address
                    </label>
                    <input
                      id="edit-address"
                      name="address"
                      type="text"
                      value={form.address}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* About & Languages Section */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                About & Languages
              </h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="edit-about" className="block text-sm font-medium text-slate-700 mb-2">
                    About
                  </label>
                  <textarea
                    id="edit-about"
                    name="about"
                    value={form.about}
                    onChange={handleChange}
                    required
                    minLength={20}
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">Languages</label>
                  <div className="flex flex-wrap gap-2">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => toggleLanguage(lang)}
                        className={`px-3 py-1.5 text-sm rounded-lg border transition-all active:scale-95 ${
                          form.languages.includes(lang)
                            ? 'bg-primary-50 border-primary-300 text-primary-700 shadow-sm'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={cancelEditing}
                className="flex-1 py-3.5 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-all active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                id="save-profile-btn"
                type="submit"
                disabled={isSaving}
                className="flex-1 py-3.5 gradient-primary text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-60 flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
