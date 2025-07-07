import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileText, File, Image, Upload, X, Loader2, Brain, Eye, FileSearch, Key } from 'lucide-react';
import { processFileWithGemini, setGeminiApiKey, isApiKeyConfigured, testBase64Conversion, testSimpleBase64, analyzePdfContentStream, analyzeDocumentContentStream, extractPdfText, extractWordText, extractTextFileContent, processWordDocumentAlternative, testAllFileTypes } from '../services/geminiService';
import { UploadedFile } from '../types';

const FileUploadPage: React.FC = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [isApiKeyValid, setIsApiKeyValid] = useState(false);
  const [streamingAnalysis, setStreamingAnalysis] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check API key on component mount and when it changes
  useEffect(() => {
    setIsApiKeyValid(isApiKeyConfigured());
  }, []);

  // Refresh API key status when needed
  const refreshApiKeyStatus = () => {
    setIsApiKeyValid(isApiKeyConfigured());
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const maxSize = 4 * 1024 * 1024; // 4MB limit
    
    const newFiles = acceptedFiles.map(file => {
      // Check file size
      if (file.size > maxSize) {
        return {
          file,
          preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : '',
          progress: 100,
          error: `File too large. Maximum size is 4MB. Current size: ${(file.size / 1024 / 1024).toFixed(1)}MB`
        };
      }
      
      return {
        file,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : '',
        progress: 0,
      };
    });
    
    setFiles(prevFiles => [...prevFiles, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    multiple: true,
  });

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onDrop(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    setFiles(prevFiles => {
      const newFiles = [...prevFiles];
      const removedFile = newFiles.splice(index, 1)[0];
      if (removedFile.preview) {
        URL.revokeObjectURL(removedFile.preview);
      }
      return newFiles;
    });
  };

  const processFilesWithGemini = async () => {
    if (files.length === 0) return;
    
    setIsUploading(true);
    
    // Process each file with Gemini
    for (let i = 0; i < files.length; i++) {
      const fileData = files[i];
      
      // Mark file as processing
      setFiles(prevFiles => {
        const updatedFiles = [...prevFiles];
        updatedFiles[i] = {
          ...updatedFiles[i],
          isProcessing: true,
          progress: 0
        };
        return updatedFiles;
      });

      try {
        // Update progress to show processing
        setFiles(prevFiles => {
          const updatedFiles = [...prevFiles];
          updatedFiles[i] = {
            ...updatedFiles[i],
            progress: 25
          };
          return updatedFiles;
        });

        // Process file with Gemini
        const result = await processFileWithGemini(fileData.file);
        
        // Update progress to show completion
        setFiles(prevFiles => {
          const updatedFiles = [...prevFiles];
          updatedFiles[i] = {
            ...updatedFiles[i],
            progress: 100,
            isProcessing: false,
            summary: result.summary,
            extractedText: result.extractedText,
            error: result.error,
            processedAt: new Date().toISOString()
          };
          return updatedFiles;
        });

        // Log success for debugging
        if (!result.error) {
          console.log(`Successfully processed file: ${fileData.file.name}`);
        }

        // Small delay between files
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.error(`Error processing file ${fileData.file.name}:`, error);
        setFiles(prevFiles => {
          const updatedFiles = [...prevFiles];
          updatedFiles[i] = {
            ...updatedFiles[i],
            progress: 100,
            isProcessing: false,
            error: error instanceof Error ? error.message : "Failed to process file"
          };
          return updatedFiles;
        });
      }
    }
    
    setIsUploading(false);
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="w-5 h-5 text-green-500" />;
    if (file.type === 'application/pdf') return <FileText className="w-5 h-5 text-red-500" />;
    if (file.type === 'application/msword') return <FileText className="w-5 h-5 text-blue-500" />;
    if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return <FileText className="w-5 h-5 text-blue-600" />;
    if (file.type === 'text/plain') return <FileText className="w-5 h-5 text-gray-600" />;
    return <File className="w-5 h-5 text-gray-400" />;
  };

  const getFileTypeDescription = (file: File) => {
    if (file.type.startsWith('image/')) return 'Image';
    if (file.type === 'application/pdf') return 'PDF Document';
    if (file.type === 'application/msword') return 'Word Document (.doc)';
    if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'Word Document (.docx)';
    if (file.type === 'text/plain') return 'Text File';
    return 'Unknown File Type';
  };

  const supportsStreamingAnalysis = (file: File) => {
    const supportedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    return supportedTypes.includes(file.type);
  };

  const formatAIResponse = (text: string) => {
    // Add custom styling for AI response formatting
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-800">$1</strong>')
      .replace(/📋/g, '<span class="text-blue-600 text-lg mr-2">📋</span>')
      .replace(/🔍/g, '<span class="text-green-600 text-lg mr-2">🔍</span>')
      .replace(/📚/g, '<span class="text-purple-600 text-lg mr-2">📚</span>')
      .replace(/💡/g, '<span class="text-orange-600 text-lg mr-2">💡</span>')
      .replace(/- (.*)/g, '<div class="flex items-start space-x-2 mb-2"><span class="text-blue-500 mt-1">•</span><span>$1</span></div>')
      .replace(/\n\n/g, '</div><div class="mb-3">')
      .replace(/^/, '<div class="space-y-3">')
      .replace(/$/, '</div>');
  };

  // Loading animation component
  const LoadingDots = () => (
    <div className="flex space-x-1">
      <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
    </div>
  );

  const handleApiKeySubmit = () => {
    if (apiKey.trim()) {
      setGeminiApiKey(apiKey.trim());
      refreshApiKeyStatus();
      setShowApiKeyInput(false);
      setApiKey('');
    }
  };

  const handleTestBase64 = async (file: File) => {
    console.log('Testing base64 conversion for:', file.name);
    
    // First test simple base64
    const simpleTest = testSimpleBase64();
    console.log('Simple base64 test result:', simpleTest);
    
    if (!simpleTest) {
      alert('Simple base64 test failed - browser issue detected');
      return;
    }
    
    const result = await testBase64Conversion(file);
    if (result) {
      alert('Base64 conversion test: SUCCESS');
    } else {
      alert('Base64 conversion test: FAILED - Check console for details');
    }
  };

  const handleTestAllFileTypes = async () => {
    console.log('Testing all supported file types...');
    
    try {
      const results = await testAllFileTypes();
      const successCount = Object.values(results).filter(Boolean).length;
      const totalCount = Object.keys(results).length;
      
      alert(`File type tests completed: ${successCount}/${totalCount} passed. Check console for details.`);
    } catch (error) {
      console.error('Test error:', error);
      alert('Test failed. Check console for details.');
    }
  };

  const handleStreamingAnalysis = async (file: File) => {
    const supportedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    if (!supportedTypes.includes(file.type)) {
      alert('Streaming analysis is only available for PDF, Word documents, and text files');
      return;
    }

    setIsStreaming(true);
    setStreamingAnalysis('');

    try {
      let extractedText = '';
      
      // Extract text based on file type
      if (file.type === 'application/pdf') {
        extractedText = await extractPdfText(file);
      } else if (file.type === 'application/msword' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        try {
          extractedText = await extractWordText(file);
        } catch (wordError) {
          console.log('Standard Word extraction failed, trying alternative method:', wordError);
          extractedText = await processWordDocumentAlternative(file);
        }
      } else if (file.type === 'text/plain') {
        extractedText = await extractTextFileContent(file);
      }
      
      // Start streaming analysis
      const prompt = "Provide a comprehensive summary of this document including main topics, key points, and educational value.";
      const stream = await analyzeDocumentContentStream(extractedText, prompt);
      
      let fullResponse = '';
      for await (const chunk of stream) {
        const text = chunk.text || '';
        fullResponse += text;
        setStreamingAnalysis(fullResponse);
      }
      
      console.log('Streaming analysis completed');
      
    } catch (error) {
      console.error('Streaming analysis error:', error);
      setStreamingAnalysis('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header Section */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg mb-3 shadow-md">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2 bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
            AI-Powered File Analysis
          </h1>
          <p className="text-sm text-gray-600 max-w-lg mx-auto">
            Upload documents, images, and files to get intelligent summaries, text extraction, and comprehensive analysis powered by Google Gemini AI.
          </p>
        </div>
        
        {/* API Key Setup */}
        {!isApiKeyValid ? (
          <div className="mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-yellow-100 rounded-md">
                  <Key className="w-4 h-4 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-yellow-800">API Key Required</h3>
                  <p className="text-xs text-yellow-700">Set up your Gemini API key to start analyzing files</p>
                </div>
              </div>
              <button
                onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                className="px-3 py-1.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-md text-xs font-medium hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                {showApiKeyInput ? 'Cancel' : 'Set API Key'}
              </button>
            </div>
            
            {showApiKeyInput && (
              <div className="space-y-3 p-3 bg-white rounded-lg border border-yellow-200">
                <p className="text-xs text-gray-700">
                  Enter your Google Gemini API key to enable AI file processing:
                </p>
                <div className="flex space-x-2">
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your Gemini API key"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-xs focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200"
                  />
                  <button
                    onClick={handleApiKeySubmit}
                    disabled={!apiKey.trim()}
                    className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-md text-xs font-medium hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    Save Key
                  </button>
                </div>
                <div className="flex items-center space-x-2 text-xs text-yellow-600">
                  <span>💡</span>
                  <span>Get your API key from </span>
                  <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-700 font-medium">Google AI Studio</a>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-green-100 rounded-md">
                  <Key className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-green-800">API Key Configured ✓</h3>
                  <p className="text-xs text-green-700">Ready to analyze files with AI</p>
                </div>
              </div>
              <button
                onClick={handleTestAllFileTypes}
                className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-md text-xs font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-sm hover:shadow-md"
                title="Test all supported file types"
              >
                Test File Types
              </button>
            </div>
          </div>
        )}
        
        <div 
          {...getRootProps()} 
          className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
            isDragActive 
              ? 'border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg scale-[1.02]' 
              : 'border-gray-300 hover:border-blue-400 hover:bg-gradient-to-br hover:from-gray-50 hover:to-blue-50 hover:shadow-md'
          }`}
        >
          <input {...getInputProps()} />
          
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-xl"></div>
          </div>
          
          <div className="relative flex flex-col items-center justify-center space-y-4">
            {/* Upload Icon */}
            <div className={`p-4 rounded-xl transition-all duration-300 ${
              isDragActive 
                ? 'bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg scale-110' 
                : 'bg-gradient-to-br from-gray-100 to-gray-200'
            }`}>
              <Upload className={`w-8 h-8 transition-all duration-300 ${
                isDragActive ? 'text-white' : 'text-gray-400'
              }`} />
            </div>
            
            {/* Content */}
            <div className="max-w-sm">
              <h3 className={`text-xl font-bold mb-2 transition-colors duration-300 ${
                isDragActive ? 'text-blue-700' : 'text-gray-800'
              }`}>
                {isDragActive ? 'Drop files here' : 'Upload Files for AI Analysis'}
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Drag and drop your files here, or click to browse. Our AI will analyze documents, extract text, and provide comprehensive summaries.
              </p>
              
              {/* File Type Info */}
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-gray-200 mb-3">
                <h4 className="text-xs font-semibold text-gray-800 mb-1">Supported Formats</h4>
                <div className="grid grid-cols-2 gap-1 text-xs text-gray-600">
                  <div className="flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    <span>Images (JPEG, PNG, GIF, WebP)</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                    <span>PDF Documents</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    <span>Word Documents (.doc, .docx)</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 bg-gray-500 rounded-full"></span>
                    <span>Text Files (.txt)</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Maximum file size: 4MB per file</p>
              </div>
              
              {/* Tip */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-2 border border-blue-200">
                <p className="text-xs text-blue-700 flex items-start space-x-1">
                  <span className="text-blue-500 mt-0.5">💡</span>
                  <span><strong>Pro Tip:</strong> For best results with Word documents, consider converting to PDF format.</span>
                </p>
              </div>
            </div>
            
            {/* Action Button */}
            <button 
              type="button" 
              className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                isDragActive
                  ? 'bg-white text-blue-600 hover:bg-gray-50'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              {isDragActive ? 'Browse Files' : 'Select Files'}
            </button>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInput}
              className="hidden"
              multiple
              accept="image/*,.pdf,.doc,.docx,.txt"
            />
          </div>
        </div>

        {files.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Files Ready for Analysis</h2>
                <p className="text-gray-600">Process your files with AI to get intelligent summaries and insights</p>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>{files.length} {files.length === 1 ? 'file' : 'files'} selected</span>
              </div>
            </div>
            
            <div className="space-y-6">
              {files.map((fileData, index) => (
                <div key={index} className="group">
                  {/* File Item */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 group-hover:border-blue-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* File Icon */}
                        <div className={`p-4 rounded-xl transition-all duration-300 ${
                          fileData.isProcessing 
                            ? 'bg-gradient-to-br from-blue-100 to-indigo-100 animate-pulse' 
                            : 'bg-gradient-to-br from-gray-50 to-gray-100'
                        }`}>
                          {getFileIcon(fileData.file)}
                        </div>
                        
                        {/* File Info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                              {fileData.file.name}
                            </h3>
                            {fileData.isProcessing && (
                              <div className="flex items-center space-x-2 px-3 py-1 bg-blue-100 rounded-full">
                                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                                <span className="text-sm font-medium text-blue-700">Processing</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-2">
                              <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                              <span className="font-medium">{getFileTypeDescription(fileData.file)}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                              <span>{(fileData.file.size / 1024).toFixed(1)} KB</span>
                            </div>
                            {fileData.processedAt && (
                              <div className="flex items-center space-x-2">
                                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                <span>Processed {new Date(fileData.processedAt).toLocaleTimeString()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        {/* Progress Bar */}
                        <div className="flex items-center space-x-3">
                          <div className="w-32 h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500 rounded-full shadow-sm"
                              style={{ width: `${fileData.progress}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-600 w-12 text-right">
                            {fileData.progress}%
                          </span>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleTestBase64(fileData.file)}
                            className="p-3 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all duration-200 group/btn"
                            disabled={isUploading}
                            title="Test Base64 Conversion"
                          >
                            <FileSearch className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                          </button>
                          {supportsStreamingAnalysis(fileData.file) && (
                            <button
                              onClick={() => handleStreamingAnalysis(fileData.file)}
                              className="p-3 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-xl transition-all duration-200 group/btn"
                              disabled={isUploading || isStreaming}
                              title="Streaming Analysis"
                            >
                              <Brain className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                            </button>
                          )}
                          <button
                            onClick={() => removeFile(index)}
                            className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 group/btn"
                            disabled={isUploading}
                            title="Remove File"
                          >
                            <X className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* AI Processing Results */}
                  {fileData.summary && (
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-sm overflow-hidden">
                      {/* Header */}
                      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Brain className="w-5 h-5 text-white" />
                            <h4 className="text-sm font-semibold text-white">AI Analysis Summary</h4>
                          </div>
                          {fileData.processedAt && (
                            <span className="text-xs text-blue-100">
                              {new Date(fileData.processedAt).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="p-4">
                        {/* Summary */}
                        <div className="mb-4">
                          <h5 className="text-sm font-medium text-gray-800 mb-2 flex items-center">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                            Document Summary
                          </h5>
                          <div className="bg-white rounded-lg p-4 border border-blue-100 shadow-sm">
                            <div className="prose prose-sm max-w-none">
                              <div 
                                className="text-sm text-gray-700 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: formatAIResponse(fileData.summary) }}
                              />
                            </div>
                          </div>
                        </div>
                        
                        {/* Extracted Text */}
                        {fileData.extractedText && (
                          <div className="mb-4">
                            <details className="group">
                              <summary className="text-sm font-medium text-blue-700 cursor-pointer hover:text-blue-800 flex items-center space-x-2 p-2 rounded-md hover:bg-blue-50 transition-colors">
                                <FileSearch className="w-4 h-4" />
                                <span>View Extracted Text</span>
                                <span className="text-xs text-blue-500 group-open:rotate-180 transition-transform">
                                  ▼
                                </span>
                              </summary>
                              <div className="mt-3 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                                  <span className="text-xs font-medium text-gray-600">Raw Text Content</span>
                                </div>
                                <div className="max-h-60 overflow-y-auto p-4">
                                  <div className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap font-mono">
                                    {fileData.extractedText}
                                  </div>
                                </div>
                              </div>
                            </details>
                          </div>
                        )}
                        
                        {/* File Info */}
                        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                          <span>File: {fileData.file.name}</span>
                          <span>{getFileTypeDescription(fileData.file)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {fileData.error && (
                    <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl border border-red-200 shadow-sm overflow-hidden">
                      {/* Header */}
                      <div className="bg-gradient-to-r from-red-600 to-pink-600 px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <X className="w-5 h-5 text-white" />
                          <h4 className="text-sm font-semibold text-white">Processing Error</h4>
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="p-4">
                        <div className="bg-white rounded-lg p-4 border border-red-100 shadow-sm">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                              <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-red-700 leading-relaxed">{fileData.error}</p>
                              <p className="text-xs text-red-500 mt-2">
                                Try uploading a different file or check if the file is corrupted.
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {/* File Info */}
                        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100 mt-3">
                          <span>File: {fileData.file.name}</span>
                          <span>{getFileTypeDescription(fileData.file)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Streaming Analysis Results */}
                  {streamingAnalysis && (
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200 shadow-sm overflow-hidden">
                      {/* Header */}
                      <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-white/20 rounded-lg">
                              <Brain className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h4 className="text-base font-semibold text-white">
                                {isStreaming ? 'Live AI Analysis' : 'Analysis Complete'}
                              </h4>
                              <p className="text-xs text-green-100">
                                {isStreaming ? 'Processing document in real-time...' : 'Streaming analysis finished'}
                              </p>
                            </div>
                          </div>
                          {isStreaming && (
                            <div className="flex items-center space-x-3">
                              <LoadingDots />
                              <span className="text-xs text-green-100 font-medium">LIVE</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="p-6">
                        <div className="bg-white rounded-xl border border-green-100 shadow-sm overflow-hidden">
                          <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-3 border-b border-green-200">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-semibold text-green-700">Real-time AI Analysis</span>
                              {isStreaming && (
                                <div className="flex items-center space-x-1">
                                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                  <span className="text-xs text-green-600 font-medium">Processing...</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="max-h-96 overflow-y-auto p-6">
                            <div className="prose prose-sm max-w-none">
                              <div 
                                className="text-sm text-gray-700 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: formatAIResponse(streamingAnalysis) }}
                              />
                              {isStreaming && (
                                <span className="inline-block w-2 h-4 bg-green-600 animate-pulse ml-1"></span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Status */}
                        <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100 mt-4">
                          <div className="flex items-center space-x-2">
                            <span>📄 {fileData.file.name}</span>
                            <span>•</span>
                            <span>{getFileTypeDescription(fileData.file)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`w-3 h-3 rounded-full ${isStreaming ? 'bg-green-500 animate-pulse' : 'bg-green-400'}`}></span>
                            <span className="font-medium">{isStreaming ? 'Processing...' : 'Complete'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-12 bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                    <span className="font-medium">{files.length} {files.length === 1 ? 'file' : 'files'} ready for processing</span>
                  </div>
                  {!isApiKeyValid && (
                    <div className="flex items-center space-x-2 text-sm text-red-600">
                      <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                      <span className="font-medium">API key required</span>
                    </div>
                  )}
                  {isUploading && (
                    <div className="flex items-center space-x-2 text-sm text-blue-600">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="font-medium">Processing files...</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setFiles([])}
                    className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 font-semibold"
                    disabled={isUploading}
                  >
                    Clear All
                  </button>
                  <button
                    onClick={processFilesWithGemini}
                    disabled={isUploading || files.length === 0 || !isApiKeyValid}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Processing Files...</span>
                      </>
                    ) : !isApiKeyValid ? (
                      <>
                        <Key className="w-5 h-5" />
                        <span>API Key Required</span>
                      </>
                    ) : (
                      <>
                        <Brain className="w-5 h-5" />
                        <span>Process {files.length} {files.length === 1 ? 'File' : 'Files'} with AI</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploadPage;
