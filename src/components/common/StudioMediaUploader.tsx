import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Image as ImageIcon,
  Video,
  Trash2,
  ExternalLink,
  CheckCircle2,
  Film,
  Camera,
  Play,
  RotateCw,
} from 'lucide-react';
import { optimizeImageFile, readVideoFile, formatFileSize } from '../../utils/mediaUpload';

interface StudioMediaUploaderProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  mediaType?: 'image' | 'video' | 'both';
  placeholder?: string;
  helperText?: string;
  required?: boolean;
}

export const StudioMediaUploader: React.FC<StudioMediaUploaderProps> = ({
  label,
  value,
  onChange,
  mediaType = 'image',
  placeholder = 'https://...',
  helperText,
  required = false,
}) => {
  const [tab, setTab] = useState<'upload' | 'url'>('upload');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStats, setUploadStats] = useState<{ name: string; size: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isVideoValue =
    value?.startsWith('data:video/') ||
    /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(value || '');

  const acceptTypes =
    mediaType === 'video'
      ? 'video/*'
      : mediaType === 'both'
      ? 'image/*,video/*'
      : 'image/*';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setIsProcessing(true);

    try {
      const isVideo = file.type.startsWith('video/');

      // Video size check (reject if > 8MB to protect localStorage)
      if (isVideo && file.size > 8 * 1024 * 1024) {
        setErrorMessage('حجم الفيديو كبير جداً (أكثر من 8MB). يرجى اختيار مقطع فيديو أقصر لتجنب تجاوز سعة التخزين في المتصفح.');
        setIsProcessing(false);
        return;
      }

      let resultUrl = '';
      if (isVideo) {
        resultUrl = await readVideoFile(file);
      } else {
        resultUrl = await optimizeImageFile(file, 300);
      }

      const calculatedSize = Math.round(resultUrl.length * 0.75);
      setUploadStats({
        name: file.name,
        size: `${formatFileSize(calculatedSize)} (دقة فائقة HD)`,
      });

      onChange(resultUrl);
    } catch (err: any) {
      setErrorMessage('تعذر قراءة الملف من جهازك. يرجى المحاولة بصيغة أخرى.');
      console.error('Studio file upload error:', err);
    } finally {
      setIsProcessing(false);
      // Reset input value to allow selecting same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClear = () => {
    onChange('');
    setUploadStats(null);
    setErrorMessage(null);
  };

  return (
    <div className="space-y-2 text-right">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-stone-700">
          {label} {required && <span className="text-rose-600">*</span>}
        </label>

        {/* Switch between Upload from Studio & Direct URL */}
        <div className="flex items-center bg-stone-100 p-0.5 rounded-lg text-[11px] font-bold">
          <button
            type="button"
            onClick={() => setTab('upload')}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
              tab === 'upload'
                ? 'bg-white text-rose-600 shadow-2xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Camera className="w-3 h-3" />
            <span>من الاستوديو</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('url')}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
              tab === 'url'
                ? 'bg-white text-rose-600 shadow-2xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <ExternalLink className="w-3 h-3" />
            <span>رابط ويب</span>
          </button>
        </div>
      </div>

      {/* Hidden native file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptTypes}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Mode A: Upload from Device Studio / Gallery */}
      {tab === 'upload' && (
        <div className="space-y-2">
          {!value ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
                isProcessing
                  ? 'border-rose-300 bg-rose-50/50 cursor-wait'
                  : 'border-rose-200 hover:border-rose-400 bg-rose-50/20 hover:bg-rose-50/40'
              }`}
            >
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shadow-2xs">
                  {isProcessing ? (
                    <RotateCw className="w-5 h-5 animate-spin" />
                  ) : mediaType === 'video' ? (
                    <Video className="w-5 h-5" />
                  ) : (
                    <UploadCloud className="w-5 h-5" />
                  )}
                </div>

                <div>
                  <p className="text-xs font-bold text-stone-800">
                    {isProcessing
                      ? 'جاري تجهيز وضغط الملف من الاستوديو...'
                      : mediaType === 'video'
                      ? 'اضغط لاختيار فيديو من استوديو هاتفك أو جهازك'
                      : mediaType === 'both'
                      ? 'اضغط لاختيار صورة أو فيديو من الاستوديو'
                      : 'اضغط لاختيار صورة من استوديو هاتفك أو جهازك'}
                  </p>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    {mediaType === 'video'
                      ? 'يدعم MP4, WebM, MOV مباشرة'
                      : 'يتم ضغط الصورة تلقائياً لأقل من 300KB بدقة HD فائقة دون أي تغبيش'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Media Preview Box */
            <div className="relative rounded-2xl overflow-hidden border border-rose-200 bg-stone-900 group">
              {isVideoValue ? (
                <div className="relative aspect-video max-h-48 bg-black flex items-center justify-center">
                  <video
                    src={value}
                    controls
                    className="max-h-48 w-full object-contain"
                  />
                  <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-mono">
                    <Film className="w-3 h-3 text-rose-400" />
                    <span>فيديو</span>
                  </div>
                </div>
              ) : (
                <div className="relative aspect-video max-h-48 bg-stone-100 flex items-center justify-center overflow-hidden">
                  <img
                    src={value}
                    alt="معاينة من الاستوديو"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ImageIcon className="w-3 h-3 text-rose-400" />
                    <span>صورة</span>
                  </div>
                </div>
              )}

              {/* Bottom Control Bar on Preview */}
              <div className="p-2.5 bg-white border-t border-rose-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-stone-600 truncate">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="truncate font-semibold text-[11px]">
                    {uploadStats?.name || 'تم اختيار الملف بنجاح'}
                  </span>
                  {uploadStats?.size && (
                    <span className="text-[10px] text-stone-400 font-mono">
                      ({uploadStats.size})
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-[11px] transition-colors cursor-pointer"
                  >
                    تغيير
                  </button>
                  <button
                    type="button"
                    onClick={handleClear}
                    className="p-1 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mode B: Direct URL Input */}
      {tab === 'url' && (
        <div className="space-y-2">
          <input
            type="url"
            dir="ltr"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full text-xs border border-rose-200 rounded-xl px-3.5 py-2.5 bg-rose-50/20 focus:bg-white outline-hidden focus:border-rose-400 font-mono"
          />

          {value && (
            <div className="flex items-center justify-between p-2 rounded-xl bg-stone-50 border border-stone-200 text-xs">
              <span className="text-stone-500 text-[11px]">معاينة الرابط:</span>
              <div className="flex items-center gap-2">
                {isVideoValue ? (
                  <span className="text-[11px] text-rose-600 font-bold flex items-center gap-1">
                    <Video className="w-3.5 h-3.5" />
                    رابط فيديو
                  </span>
                ) : (
                  <img
                    src={value}
                    alt="معاينة الرابط"
                    className="w-8 h-8 rounded-lg object-cover border border-rose-200"
                    onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
                  />
                )}
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-red-500 hover:text-red-700 text-xs font-bold cursor-pointer"
                >
                  مسح
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error notification if any */}
      {errorMessage && (
        <p className="text-[11px] text-amber-600 font-medium">{errorMessage}</p>
      )}

      {helperText && !errorMessage && (
        <p className="text-[11px] text-stone-400">{helperText}</p>
      )}
    </div>
  );
};
