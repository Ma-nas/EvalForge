import { useState, useCallback, useEffect } from 'react';
import {
  Database, Upload, Trash2, Eye, Play, Sparkles, FileSpreadsheet, FileJson,
  Loader2, CheckCircle2
} from 'lucide-react';

import { useDropzone } from 'react-dropzone';
import { datasetService } from '../api';
import { useToast } from '../components/Toast';

export default function Datasets() {
  const [datasets, setDatasets] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const [evaluatingId, setEvaluatingId] = useState<string | null>(null);
  const [batchResult, setBatchResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const loadDatasets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await datasetService.list();
      setDatasets(res.data.datasets);
    } catch {
      // Backend may still be initializing
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDatasets();
  }, [loadDatasets]);

  const handleSeedSamples = async () => {
    setLoading(true);
    try {
      const res = await datasetService.seed();
      setDatasets(res.data.datasets);
      addToast({
        type: 'success',
        title: 'DATA ARMORY RESTORED',
        message: `Seeded ${res.data.datasets.length} standard benchmark datasets.`,
      });
    } catch (err: any) {
      addToast({ type: 'error', title: 'SEEDING FAILED', message: 'Could not restore default datasets.' });
    } finally {
      setLoading(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];

    if (file.size > 10 * 1024 * 1024) {
      addToast({
        type: 'error',
        title: 'PAYLOAD TOO LARGE',
        message: `${file.name} exceeds 10MB limit.`,
      });
      return;
    }

    setUploading(true);
    try {
      await datasetService.upload(file);
      await loadDatasets();
      addToast({
        type: 'success',
        title: 'PAYLOAD SECURED',
        message: `${file.name} uploaded to Data Armory.`,
      });
    } catch (err: any) {
      addToast({ type: 'error', title: 'UPLOAD REJECTED', message: err.response?.data?.detail || 'Upload failed.' });
    } finally {
      setUploading(false);
    }
  }, [loadDatasets, addToast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'], 'application/json': ['.json'] },
    maxFiles: 1,
  });

  const handleDelete = async (id: string, filename: string) => {
    try {
      await datasetService.delete(id);
      await loadDatasets();
      if (preview?.id === id) setPreview(null);
      addToast({ type: 'success', title: 'PAYLOAD DELETED', message: `${filename} deleted.` });
    } catch {
      addToast({ type: 'error', title: 'DELETE FAILED', message: 'Could not remove dataset.' });
    }
  };

  const handlePreview = async (dataset: any) => {
    try {
      const res = await datasetService.getData(dataset.id, 10);
      setPreview({ ...dataset, data: res.data.data });
    } catch {
      addToast({ type: 'error', title: 'PREVIEW FAILED', message: 'Could not load dataset data.' });
    }
  };

  const handleBatchEvaluate = async (dataset: any) => {
    setEvaluatingId(dataset.id);
    setBatchResult(null);
    try {
      const res = await datasetService.evaluateBatch(dataset.id, {
        max_samples: 10,
        model_name: 'gemini-1.5-flash',
      });
      setBatchResult(res.data);
      addToast({
        type: 'success',
        title: 'BATCH MISSION ACCOMPLISHED',
        message: `Evaluated ${res.data.total_samples} samples from ${dataset.filename}. Composite Score: ${(res.data.avg_composite_score * 100).toFixed(1)}%`,
      });
    } catch (err: any) {
      addToast({ type: 'error', title: 'BATCH FAILED', message: err.response?.data?.detail || 'Batch run failed.' });
    } finally {
      setEvaluatingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* ─── Header ────────────────────────────────────────── */}
      <div className="border-b-2 border-zinc-800 pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="stamp-badge stamp-verified text-xs">SECTOR-06 STORAGE</span>
            <span className="font-hud text-xs text-orange-400">// BENCHMARK CORPUS ARMORY</span>
          </div>
          <h1 className="gta-title text-5xl lg:text-6xl mt-1 tracking-wide">
            DATA ARMORY & CORPUS
          </h1>
          <p className="font-hud text-xs text-zinc-400 tracking-widest mt-1">
            MANAGE DATASETS • INSPECT RAW TEST MATRICES • DISPATCH AUTOMATED BATCH RUNS
          </p>
        </div>

        <button
          type="button"
          onClick={handleSeedSamples}
          className="btn-gta btn-gta-ghost text-xs px-4 py-2.5"
        >
          <Sparkles className="w-4 h-4 text-orange-400" /> RESTORE DEFAULT SAMPLES
        </button>
      </div>

      {/* ─── Drag & Drop Upload Panel ───────────────────────── */}
      <div
        {...getRootProps()}
        className={`hud-panel p-10 text-center cursor-pointer transition-all border-dashed ${
          isDragActive
            ? 'border-orange-500 bg-orange-500/10'
            : 'border-zinc-700 hover:border-orange-500/70'
        }`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
            <p className="font-gta text-2xl text-orange-400 tracking-wide">SECURING PAYLOAD...</p>
          </div>
        ) : (
          <div>
            <Upload className={`w-12 h-12 mx-auto mb-3 ${isDragActive ? 'text-orange-400' : 'text-zinc-600'}`} />
            <p className="font-gta text-3xl text-zinc-200 tracking-wide">
              {isDragActive ? 'DROP PAYLOAD TO ARM ENGINE' : 'DRAG & DROP BENCHMARK CORPUS'}
            </p>
            <p className="font-hud text-xs text-zinc-500 mt-1">
              SUPPORTED FORMATS: .CSV, .JSON • MAXIMUM PAYLOAD: 10MB
            </p>
          </div>
        )}
      </div>

      {/* ─── Batch Evaluation Results Card ──────────────────── */}
      {batchResult && (
        <div className="hud-panel p-6 border-2 border-emerald-500/80 bg-gradient-to-r from-[#0d131a] to-[#0a1512]">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="font-hud text-xs text-emerald-400 tracking-widest flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                BATCH MISSION REPORT
              </div>
              <h3 className="gta-title text-4xl text-white mt-1">
                EVALUATED {batchResult.total_samples} SAMPLES
              </h3>
            </div>
            <button
              onClick={() => setBatchResult(null)}
              className="text-zinc-400 hover:text-white text-xs font-hud"
            >
              [ CLOSE REPORT ]
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-black/60 border border-zinc-800 font-hud text-center">
            <div>
              <span className="text-[10px] text-zinc-400">AVG ACCURACY</span>
              <div className="font-gta text-3xl text-emerald-400 leading-none mt-1">
                {(batchResult.avg_composite_score * 100).toFixed(1)}%
              </div>
            </div>
            <div>
              <span className="text-[10px] text-zinc-400">AVG SEMANTIC SIM</span>
              <div className="font-gta text-3xl text-purple-400 leading-none mt-1">
                {(batchResult.avg_semantic_similarity * 100).toFixed(1)}%
              </div>
            </div>
            <div>
              <span className="text-[10px] text-zinc-400">AVG RELEVANCE</span>
              <div className="font-gta text-3xl text-orange-400 leading-none mt-1">
                {(batchResult.avg_relevance_score * 100).toFixed(1)}%
              </div>
            </div>
            <div>
              <span className="text-[10px] text-zinc-400">AVG GROUNDING</span>
              <div className="font-gta text-3xl text-cyan-400 leading-none mt-1">
                {(batchResult.avg_groundedness_score * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Dataset List ──────────────────────────────────── */}
      <div className="hud-panel p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
          <h3 className="font-gta text-2xl text-zinc-100 tracking-wider flex items-center gap-2">
            <Database className="w-5 h-5 text-orange-500" /> ARMORED DATASETS ({datasets.length})
          </h3>
          <span className="text-[10px] font-mono text-zinc-500">CORPUS REGISTRY</span>
        </div>

        {loading ? (
          <div className="text-center py-10 text-zinc-500 font-hud">ACCESSING STORAGE VAULT...</div>
        ) : datasets.length === 0 ? (
          <div className="text-center py-10">
            <p className="font-gta text-2xl text-zinc-400">ARMORY IS CURRENTLY EMPTY</p>
            <p className="text-xs font-hud text-zinc-500 mt-1 mb-4">Upload a dataset or click below to restore samples.</p>
            <button
              onClick={handleSeedSamples}
              className="btn-gta btn-gta-orange text-sm px-4 py-2"
            >
              RESTORE DEFAULT SAMPLES →
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {datasets.map((ds) => (
              <div
                key={ds.id}
                className="p-4 bg-black/40 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  {ds.format === 'csv' ? (
                    <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
                  ) : (
                    <FileJson className="w-6 h-6 text-orange-400" />
                  )}
                  <div>
                    <h4 className="font-gta text-xl text-zinc-100 tracking-wide">{ds.filename}</h4>
                    <p className="text-xs font-mono text-zinc-400">
                      {ds.total_rows} ROWS • {ds.columns.length} COLUMNS • {ds.format.toUpperCase()}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleBatchEvaluate(ds)}
                    disabled={evaluatingId === ds.id}
                    className="btn-gta btn-gta-green text-xs px-3 py-1.5"
                    title="Run batch evaluation on dataset samples"
                  >
                    {evaluatingId === ds.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Play className="w-3.5 h-3.5" />
                    )}
                    BATCH EVALUATE →
                  </button>

                  <button
                    onClick={() => handlePreview(ds)}
                    className="btn-gta btn-gta-ghost text-xs px-3 py-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" /> PREVIEW
                  </button>

                  <button
                    onClick={() => handleDelete(ds.id, ds.filename)}
                    className="p-2 text-zinc-500 hover:text-rose-500 border border-zinc-800 hover:border-rose-500/50 bg-black transition-colors"
                    title="Delete dataset"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Preview Table ─────────────────────────────────── */}
      {preview && (
        <div className="hud-panel p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
            <h3 className="font-gta text-2xl text-zinc-100 tracking-wide">
              CORPUS PREVIEW: {preview.filename}
            </h3>
            <button
              onClick={() => setPreview(null)}
              className="font-hud text-xs text-orange-400 hover:underline"
            >
              [ CLOSE PREVIEW ]
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-hud text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-zinc-800 text-zinc-400 bg-zinc-950/60">
                  {preview.columns.map((col: string) => (
                    <th key={col} className="p-2.5 whitespace-nowrap">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850 font-mono">
                {preview.data?.map((row: any, i: number) => (
                  <tr key={i} className="hover:bg-zinc-900/40">
                    {preview.columns.map((col: string) => (
                      <td key={col} className="p-2.5 max-w-[240px] truncate text-zinc-300">
                        {String(row[col] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
