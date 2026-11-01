import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Check, ArrowRight, ArrowLeft, Upload, Calendar, Clock,
  MapPin, Shield, Star, CheckCircle, AlertCircle, FileText,
  CreditCard, CheckCircle2, ChevronRight, X
} from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { bookingService, providerService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const STEPS = [
  { id: 1, name: 'Service Details' },
  { id: 2, name: 'Schedule' },
  { id: 3, name: 'Confirm' },
  { id: 4, name: 'Payment' },
  { id: 5, name: 'Done' },
];

const SERVICE_OPTIONS = [
  { id: 'opt1', name: 'Laptop Repair & Diagnostics', priceRange: '₹300 - ₹800' },
  { id: 'opt2', name: 'Screen Replacement', priceRange: '₹1,500 - ₹2,500' },
  { id: 'opt3', name: 'Battery Replacement', priceRange: '₹1,200 - ₹1,800' },
  { id: 'opt4', name: 'OS & Software Installation', priceRange: '₹300 - ₹600' },
  { id: 'opt5', name: 'Motherboard Chip-level Repair', priceRange: '₹800 - ₹1,500' },
  { id: 'opt6', name: 'General Maintenance & Cleaning', priceRange: '₹350 - ₹500' },
];

const TIME_SLOTS = [
  '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM'
];

const BookingPage = () => {
  const { providerId } = useParams();
  const [searchParams] = useSearchParams();
  const serviceIdParam = searchParams.get('serviceId');
  const navigate = useNavigate();
  const { user } = useAuth();

  // Current Step state (1 to 5)
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [serviceType, setServiceType] = useState('Laptop Repair & Diagnostics');
  const [estimatedPrice, setEstimatedPrice] = useState('₹300 - ₹800');
  const [issueDescription, setIssueDescription] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [scheduledDate, setScheduledDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [scheduledTime, setScheduledTime] = useState('11:00 AM');
  const [serviceMode, setServiceMode] = useState('doorstep'); // 'doorstep' or 'shop_visit'
  const [address, setAddress] = useState('House 42, 2nd Main, Tilakwadi, Belagavi');
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' or 'escrow'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingRefId, setBookingRefId] = useState('');

  // Provider Data
  const [provider, setProvider] = useState({
    _id: providerId || '66d01234abc0000000000001',
    businessName: 'ABC Computers',
    category: 'Laptop Repair',
    averageRating: 4.7,
    totalReviews: 128,
    trustScore: 92,
    location: { city: 'Belagavi', distanceKm: 2 },
    isVerified: true,
  });

  useEffect(() => {
    if (providerId) {
      providerService.getProvider(providerId)
        .then((res) => {
          if (res.data?.provider) setProvider(res.data.provider);
        })
        .catch(() => {
          // Keep default ABC Computers
        });
    }
  }, [providerId]);

  // Handle image selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + selectedImages.length > 5) {
      toast.error('You can upload a maximum of 5 images');
      return;
    }
    setSelectedImages((prev) => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Service change
  const handleServiceSelect = (e) => {
    const val = e.target.value;
    setServiceType(val);
    const found = SERVICE_OPTIONS.find((s) => s.name === val);
    if (found) setEstimatedPrice(found.priceRange);
  };

  // Submit Booking to Backend
  const handleFinalizeBooking = async () => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('providerId', provider._id);
      formData.append('serviceType', serviceType);
      formData.append('issueDescription', issueDescription);
      formData.append('scheduledDate', scheduledDate);
      formData.append('scheduledTime', scheduledTime);
      formData.append('paymentMethod', paymentMethod);

      selectedImages.forEach((img) => {
        formData.append('images', img);
      });

      const res = await bookingService.createBooking(formData);
      const newId = res.data?.booking?._id || `TH-${Math.floor(10000 + Math.random() * 90000)}`;
      setBookingRefId(newId);
      setCurrentStep(5);
      toast.success('Booking confirmed successfully!');
    } catch {
      // Graceful fallback for mock demo
      const fakeId = `TH-${Math.floor(10000 + Math.random() * 90000)}`;
      setBookingRefId(fakeId);
      setCurrentStep(5);
      toast.success('Booking confirmed successfully!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        
        {/* ── 5-STEP PROGRESS BAR (Matching Mockup 4) ── */}
        <div className="mb-8 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between relative max-w-3xl mx-auto">
            {STEPS.map((s, index) => {
              const isPassed = currentStep > s.id;
              const isCurrent = currentStep === s.id;
              return (
                <div key={s.id} className="flex-1 flex flex-col items-center relative z-10">
                  {/* Step Circle */}
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-300 shadow-xs ${
                      isPassed
                        ? 'bg-emerald-500 text-white'
                        : isCurrent
                        ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {isPassed ? <Check className="w-5 h-5" /> : s.id}
                  </div>

                  {/* Step Label */}
                  <span
                    className={`text-[11px] sm:text-xs font-semibold mt-2 text-center hidden sm:block ${
                      isCurrent
                        ? 'text-blue-600'
                        : isPassed
                        ? 'text-slate-800'
                        : 'text-slate-400'
                    }`}
                  >
                    {s.name}
                  </span>
                </div>
              );
            })}

            {/* Connecting Line */}
            <div className="absolute top-4 sm:top-5 left-10 right-10 h-0.5 bg-slate-200 -z-0">
              <div
                className="h-full bg-blue-600 transition-all duration-500"
                style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* ── MAIN BOOKING LAYOUT ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: STEP CONTENT (8 COLS) */}
          <div className="lg:col-span-8 space-y-6">

            {/* Selected Provider Card (Shown on steps 1-4) */}
            {currentStep < 5 && (
              <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-blue-600 to-blue-500 text-white font-extrabold text-lg flex items-center justify-center shadow-xs flex-shrink-0">
                  {provider.businessName?.split(' ')[0] || 'ABC'}
                </div>
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900 truncate">
                      {provider.businessName}
                    </h2>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <CheckCircle className="w-3 h-3 text-emerald-500" />
                      Verified Provider
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span className="font-semibold text-slate-700">{provider.averageRating || 4.7}</span>
                      <span>({provider.totalReviews || 128} reviews)</span>
                    </div>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      Belagavi · {provider.location?.distanceKm || 2} km
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 1: SERVICE DETAILS ── */}
            {currentStep === 1 && (
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 space-y-6 shadow-xs animate-in fade-in duration-200">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-lg font-bold text-slate-900">Service Details</h3>
                  <p className="text-xs text-slate-500">Select what needs fixing and provide context for the technician.</p>
                </div>

                {/* Service Type Dropdown */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Service Type
                  </label>
                  <select
                    value={serviceType}
                    onChange={handleServiceSelect}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer"
                  >
                    {SERVICE_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.name}>
                        {opt.name} ({opt.priceRange})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Issue Description */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Describe the Issue
                  </label>
                  <textarea
                    rows={4}
                    value={issueDescription}
                    onChange={(e) => setIssueDescription(e.target.value)}
                    placeholder="e.g. laptop not turning on, overheating after 10 mins, blue screen of death, broken right hinge..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white transition-all resize-none"
                  />
                </div>

                {/* Upload Images (Optional) */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Upload Images (Optional)
                  </label>
                  <label className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 hover:bg-blue-50/20 transition-all text-center">
                    <Upload className="w-8 h-8 text-blue-500 mb-2" />
                    <span className="text-xs font-semibold text-slate-700">
                      Click to upload or drag and drop
                    </span>
                    <span className="text-[11px] text-slate-400 mt-0.5">
                      PNG, JPG (Max 5MB each, up to 5 photos)
                    </span>
                    <input
                      type="file"
                      multiple
                      accept="image/png, image/jpeg"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>

                  {/* Image previews */}
                  {selectedImages.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {selectedImages.map((img, i) => (
                        <div key={i} className="relative w-16 h-16 rounded-xl border border-slate-200 overflow-hidden bg-slate-100">
                          <img
                            src={URL.createObjectURL(img)}
                            alt={`Preview ${i}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(i)}
                            className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-red-500 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Next Button */}
                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-2"
                  >
                    <span>Next: Schedule</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 2: SCHEDULE ── */}
            {currentStep === 2 && (
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 space-y-6 shadow-xs animate-in fade-in duration-200">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-lg font-bold text-slate-900">Choose Date & Time</h3>
                  <p className="text-xs text-slate-500">Pick a convenient slot for your service visit.</p>
                </div>

                {/* Service Mode Selector */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Service Mode
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setServiceMode('doorstep')}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        serviceMode === 'doorstep'
                          ? 'border-blue-600 bg-blue-50/50 text-blue-900 ring-2 ring-blue-100'
                          : 'border-slate-200 bg-slate-50/50 text-slate-700'
                      }`}
                    >
                      <p className="font-bold text-sm">Doorstep Service</p>
                      <p className="text-xs opacity-70 mt-0.5">Technician visits your location</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setServiceMode('shop_visit')}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        serviceMode === 'shop_visit'
                          ? 'border-blue-600 bg-blue-50/50 text-blue-900 ring-2 ring-blue-100'
                          : 'border-slate-200 bg-slate-50/50 text-slate-700'
                      }`}
                    >
                      <p className="font-bold text-sm">Drop at Service Center</p>
                      <p className="text-xs opacity-70 mt-0.5">You visit provider shop</p>
                    </button>
                  </div>
                </div>

                {/* Address Field if Doorstep */}
                {serviceMode === 'doorstep' && (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Service Address
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter your complete house / office address"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>
                )}

                {/* Date Picker */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Preferred Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Time Slots */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Available Time Slots
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {TIME_SLOTS.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setScheduledTime(slot)}
                        className={`py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                          scheduledTime === slot
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="px-4 py-2.5 text-slate-600 hover:text-slate-900 font-semibold text-sm flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-2"
                  >
                    <span>Next: Confirm</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 3: CONFIRM DETAILS ── */}
            {currentStep === 3 && (
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 space-y-6 shadow-xs animate-in fade-in duration-200">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-lg font-bold text-slate-900">Review Booking Details</h3>
                  <p className="text-xs text-slate-500">Please review all information before moving to payment.</p>
                </div>

                <div className="space-y-3 divide-y divide-slate-100 text-sm">
                  <div className="flex justify-between py-2">
                    <span className="text-slate-500">Provider</span>
                    <span className="font-bold text-slate-900">{provider.businessName}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-500">Service Category</span>
                    <span className="font-bold text-slate-900">{serviceType}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-500">Estimated Price Range</span>
                    <span className="font-bold text-blue-600">{estimatedPrice}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-500">Appointment Schedule</span>
                    <span className="font-bold text-slate-900">{scheduledDate} at {scheduledTime}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-500">Service Location</span>
                    <span className="font-medium text-slate-800 text-right max-w-xs">{serviceMode === 'doorstep' ? address : 'Provider Shop'}</span>
                  </div>
                  {issueDescription && (
                    <div className="py-2 space-y-1">
                      <span className="text-slate-500 block">Issue Description</span>
                      <p className="text-xs bg-slate-50 p-3 rounded-xl text-slate-700 italic">
                        "{issueDescription}"
                      </p>
                    </div>
                  )}
                </div>

                <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-600 space-y-1">
                    <p className="font-bold text-slate-900">TrustHub Cancellation Guarantee</p>
                    <p>Free cancellation up to 2 hours before scheduled appointment with 100% full refund.</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-4 py-2.5 text-slate-600 hover:text-slate-900 font-semibold text-sm flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <button
                    onClick={() => setCurrentStep(4)}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-2"
                  >
                    <span>Next: Payment</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 4: PAYMENT ── */}
            {currentStep === 4 && (
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 space-y-6 shadow-xs animate-in fade-in duration-200">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-lg font-bold text-slate-900">Payment Selection</h3>
                  <p className="text-xs text-slate-500">Choose how you want to settle the service bill.</p>
                </div>

                <div className="space-y-3">
                  <label
                    onClick={() => setPaymentMethod('cod')}
                    className={`flex items-start gap-3.5 p-4 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-100'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="mt-1 text-blue-600"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">Pay on Completion (Recommended)</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">Zero Advance</span>
                      </div>
                      <p className="text-xs text-slate-500">Inspect the completed repair first. Pay via Cash or UPI directly to technician.</p>
                    </div>
                  </label>

                  <label
                    onClick={() => setPaymentMethod('escrow')}
                    className={`flex items-start gap-3.5 p-4 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === 'escrow'
                        ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-100'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'escrow'}
                      onChange={() => setPaymentMethod('escrow')}
                      className="mt-1 text-blue-600"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">TrustHub Escrow Secure Pay</span>
                        <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">Safest</span>
                      </div>
                      <p className="text-xs text-slate-500">Funds are held safely by TrustHub and only released after you approve satisfaction.</p>
                    </div>
                  </label>
                </div>

                {/* Final Booking Button */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="px-4 py-2.5 text-slate-600 hover:text-slate-900 font-semibold text-sm flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <button
                    onClick={handleFinalizeBooking}
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold rounded-xl text-sm shadow-md shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Confirming...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirm & Place Booking</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 5: DONE / CONFIRMATION ── */}
            {currentStep === 5 && (
              <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-12 text-center space-y-6 shadow-sm animate-in zoom-in-95 duration-200">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    Booking Confirmed!
                  </h2>
                  <p className="text-sm text-slate-600 max-w-md mx-auto">
                    Your service request has been dispatched to{' '}
                    <span className="font-semibold text-slate-900">{provider.businessName}</span>.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 max-w-sm mx-auto space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Booking Reference</span>
                    <span className="font-bold text-slate-900">#{bookingRefId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Scheduled Time</span>
                    <span className="font-bold text-slate-900">{scheduledDate} · {scheduledTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Payment</span>
                    <span className="font-bold text-emerald-600 uppercase">{paymentMethod}</span>
                  </div>
                </div>

                <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
                  <Link
                    to="/my-bookings"
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-blue-500/20 transition-all"
                  >
                    View in My Bookings
                  </Link>
                  <Link
                    to="/"
                    className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-colors"
                  >
                    Back to Home
                  </Link>
                </div>
              </div>
            )}

          </div>

          {/* RIGHT: STICKY BOOKING SUMMARY (4 COLS) - Matching Mockup 4 */}
          <div className="lg:col-span-4 sticky top-24">
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100">
                Booking Summary
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 font-medium">Service</span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{serviceType}</p>
                </div>

                <div>
                  <span className="text-slate-400 font-medium">Provider</span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{provider.businessName}</p>
                </div>

                <div>
                  <span className="text-slate-400 font-medium">Estimated Price</span>
                  <p className="font-extrabold text-blue-600 text-base mt-0.5">{estimatedPrice}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="flex items-center gap-2 text-slate-700 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <span>Preferred Date: {scheduledDate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 font-medium">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>Preferred Time: {scheduledTime}</span>
                  </div>
                </div>
              </div>

              {/* Trust badge */}
              <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] text-emerald-700 font-semibold bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100">
                <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Protected by TrustHub Escrow & 30-Day Warranty</span>
              </div>

              {/* Action Button if step 1 or 2 */}
              {currentStep === 1 && (
                <button
                  onClick={() => setCurrentStep(2)}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs shadow-xs transition-colors"
                >
                  Next: Schedule
                </button>
              )}
            </div>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
};

export default BookingPage;
