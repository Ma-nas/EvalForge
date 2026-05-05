import { useState, useCallback } from 'react';
import { Database, Upload, Trash2, Eye, FileSpreadsheet, FileJson } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { datasetService } from '../api';

export default function Datasets() {
  const [datasets, setDatasets] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const [error, setError] = useState('');

  const loadDatasets = useCallback(async () => {
    try {
      const res = await datasetService.list();
      setDatasets(res.data.datasets);
    } catch { /* Backend may not be running */ }
  }, []);

  useState(() => { loadDatasets(); });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    setUploading(true); setError('');
    try {
      await datasetService.upload(acceptedFiles[0]);
      await loadDatasets();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }, [loadDatasets]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'], 'application/json': ['.json'] },
    maxFiles: 1,
  });

  const handleDelete = async (id: string) => {
    try {
      await datasetService.delete(id);
      await loadDatasets();
      if (preview?.id === id) setPreview(null);
    } catch {}
  };

  const handlePreview = async (dataset: any) => {
    try {
      const res = await datasetService.getData(dataset.id, 10);
      setPreview({ ...dataset, data: res.data.data });
    } catch {}
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold gradient-text flex items-center gap-3"><Database className="w-8 h-8" /> Datasets</h1>
        <p className="text-text-secondary mt-1">Upload and manage evaluation datasets (CSV/JSON)</p>
      </div>

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`glass-card p-10 text-center cursor-pointer transition-all duration-300 ${
          isDragActive ? 'border-accent-primary/50 bg-accent-primary/5' : 'hover:border-white/20'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragActive ? 'text-accent-primary' : 'text-text-muted'}`} />
        {uploading ? (
          <p className="text-accent-primary">Uploading...</p>
        ) : isDragActive ? (
          <p className="text-accent-primary font-medium">Drop the file here</p>
        ) : (
          <>
            <p className="text-text-secondary font-medium">Drag & drop a CSV or JSON file</p>
            <p className="text-text-muted text-sm mt-1">or click to browse</p>
          </>
        )}
      </div>

      {error && <div className="p-4 rounded-xl bg-accent-rose/10 border border-accent-rose/20 text-accent-rose text-sm">{error}</div>}

      {/* Dataset List */}
      {datasets.length > 0 && (
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-lg font-semibold text-text-primary">Uploaded Datasets ({datasets.length})</h3>
          <div className="space-y-3">
            {datasets.map((ds) => (
              <div key={ds.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/8 transition-colors">
                <div className="flex items-center gap-3">
                  {ds.format === 'csv' ? <FileSpreadsheet className="w-5 h-5 text-accent-emerald" /> : <FileJson className="w-5 h-5 text-accent-amber" />}
                  <div>
                    <p className="text-sm font-medium text-text-primary">{ds.filename}</p>
                    <p className="text-xs text-text-muted">{ds.total_rows} rows • {ds.columns.length} columns • {ds.format.toUpperCase()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handlePreview(ds)} className="btn-ghost py-1.5 px-3 text-xs flex items-center gap-1">
                    <Eye className="w-3 h-3" /> Preview
                  </button>
                  <button onClick={() => handleDelete(ds.id)} className="btn-ghost py-1.5 px-3 text-xs flex items-center gap-1 hover:text-accent-rose hover:border-accent-rose/30">
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preview */}
      {preview && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Preview: {preview.filename}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-text-muted border-b border-white/5">
                  {preview.columns.map((col: string) => (
                    <th key={col} className="pb-3 px-3 text-left whitespace-nowrap">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {preview.data?.map((row: any, i: number) => (
                  <tr key={i} className="text-text-secondary hover:bg-white/5">
                    {preview.columns.map((col: string) => (
                      <td key={col} className="py-2 px-3 max-w-[200px] truncate">{String(row[col] ?? '')}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {datasets.length === 0 && !uploading && (
        <div className="glass-card p-12 text-center">
          <Database className="w-16 h-16 mx-auto text-text-muted opacity-30 mb-4" />
          <h3 className="text-xl font-semibold text-text-secondary">No Datasets</h3>
          <p className="text-sm text-text-muted mt-2">Upload a CSV or JSON file to get started</p>
        </div>
      )}
    </div>
  );
}
