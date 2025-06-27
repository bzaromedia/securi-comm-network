import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  Image,
} from 'react-native';
import { BlurView } from 'expo-blur';
import {
  Upload,
  Download,
  File,
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  Folder,
  Share,
  Trash2,
  Eye,
  Lock,
  Unlock,
  Clock,
  User,
  Shield,
  AlertTriangle,
  CheckCircle,
  MoreVertical,
  Search,
  Filter,
  Grid,
  List,
} from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export interface SecureFile {
  id: string;
  name: string;
  type: 'document' | 'image' | 'video' | 'audio' | 'archive' | 'other';
  size: number;
  mimeType: string;
  uploadedAt: number;
  uploadedBy: string;
  encryptionLevel: 'standard' | 'enhanced' | 'military';
  accessLevel: 'private' | 'group' | 'public';
  downloadCount: number;
  expiresAt?: number;
  thumbnail?: string;
  preview?: string;
  isEncrypted: boolean;
  checksum: string;
  permissions: {
    canDownload: boolean;
    canShare: boolean;
    canDelete: boolean;
    canView: boolean;
  };
  sharedWith: string[];
  tags: string[];
}

interface FileSharingProps {
  files?: SecureFile[];
  onUpload: (files: File[]) => void;
  onDownload: (fileId: string) => void;
  onDelete: (fileId: string) => void;
  onShare: (fileId: string, userIds: string[]) => void;
  onPreview: (fileId: string) => void;
}

export function FileSharing({
  files = [],
  onUpload,
  onDownload,
  onDelete,
  onShare,
  onPreview,
}: FileSharingProps) {
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size' | 'type'>('date');
  const [filterType, setFilterType] = useState<'all' | SecureFile['type']>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Sample data if none provided
  const sampleFiles: SecureFile[] = files.length > 0 ? files : [
    {
      id: '1',
      name: 'Security_Report_Q4.pdf',
      type: 'document',
      size: 2048576, // 2MB
      mimeType: 'application/pdf',
      uploadedAt: Date.now() - 86400000,
      uploadedBy: 'Sarah Chen',
      encryptionLevel: 'military',
      accessLevel: 'group',
      downloadCount: 12,
      expiresAt: Date.now() + 86400000 * 30,
      thumbnail: 'https://images.pexels.com/photos/590016/pexels-photo-590016.jpeg?auto=compress&cs=tinysrgb&w=200',
      isEncrypted: true,
      checksum: 'sha256:abc123...',
      permissions: { canDownload: true, canShare: true, canDelete: false, canView: true },
      sharedWith: ['user1', 'user2', 'user3'],
      tags: ['security', 'report', 'quarterly'],
    },
    {
      id: '2',
      name: 'Team_Photo_2024.jpg',
      type: 'image',
      size: 5242880, // 5MB
      mimeType: 'image/jpeg',
      uploadedAt: Date.now() - 172800000,
      uploadedBy: 'Mark Johnson',
      encryptionLevel: 'enhanced',
      accessLevel: 'group',
      downloadCount: 8,
      thumbnail: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=200',
      preview: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400',
      isEncrypted: true,
      checksum: 'sha256:def456...',
      permissions: { canDownload: true, canShare: true, canDelete: true, canView: true },
      sharedWith: ['user1', 'user4'],
      tags: ['team', 'photo', '2024'],
    },
    {
      id: '3',
      name: 'Meeting_Recording.mp4',
      type: 'video',
      size: 104857600, // 100MB
      mimeType: 'video/mp4',
      uploadedAt: Date.now() - 259200000,
      uploadedBy: 'Emma Davis',
      encryptionLevel: 'standard',
      accessLevel: 'private',
      downloadCount: 3,
      thumbnail: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=200',
      isEncrypted: true,
      checksum: 'sha256:ghi789...',
      permissions: { canDownload: true, canShare: false, canDelete: true, canView: true },
      sharedWith: [],
      tags: ['meeting', 'recording', 'confidential'],
    },
  ];

  const getFileIcon = (type: SecureFile['type'], size: number = 24) => {
    switch (type) {
      case 'document': return <FileText size={size} color="#00D4FF" />;
      case 'image': return <FileImage size={size} color="#00FF94" />;
      case 'video': return <FileVideo size={size} color="#FF6B35" />;
      case 'audio': return <FileAudio size={size} color="#9D4EDD" />;
      case 'archive': return <Folder size={size} color="#FFB800" />;
      default: return <File size={size} color="#FFFFFF80" />;
    }
  };

  const getEncryptionColor = (level: SecureFile['encryptionLevel']) => {
    switch (level) {
      case 'military': return '#FF4444';
      case 'enhanced': return '#FFB800';
      default: return '#00FF94';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor(diff / 60000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const filteredFiles = sampleFiles
    .filter(file => {
      if (filterType !== 'all' && file.type !== filterType) return false;
      if (searchQuery && !file.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name);
        case 'size': return b.size - a.size;
        case 'type': return a.type.localeCompare(b.type);
        default: return b.uploadedAt - a.uploadedAt;
      }
    });

  const FileGridItem = ({ file }: { file: SecureFile }) => {
    const isSelected = selectedFiles.has(file.id);
    const encryptionColor = getEncryptionColor(file.encryptionLevel);

    return (
      <TouchableOpacity
        style={[styles.gridItem, isSelected && styles.gridItemSelected]}
        onPress={() => {
          if (selectedFiles.size > 0) {
            const newSelected = new Set(selectedFiles);
            if (isSelected) {
              newSelected.delete(file.id);
            } else {
              newSelected.add(file.id);
            }
            setSelectedFiles(newSelected);
          } else {
            onPreview(file.id);
          }
        }}
        onLongPress={() => {
          const newSelected = new Set(selectedFiles);
          newSelected.add(file.id);
          setSelectedFiles(newSelected);
        }}
      >
        <BlurView intensity={20} style={styles.gridItemBlur}>
          <View style={styles.gridItemHeader}>
            {file.thumbnail ? (
              <Image source={{ uri: file.thumbnail }} style={styles.fileThumbnail} />
            ) : (
              <View style={styles.fileIconContainer}>
                {getFileIcon(file.type, 32)}
              </View>
            )}
            <View style={styles.fileActions}>
              <View style={[styles.encryptionBadge, { backgroundColor: encryptionColor }]}>
                <Lock size={8} color="#000000" />
              </View>
              <TouchableOpacity style={styles.fileActionButton}>
                <MoreVertical size={14} color="#FFFFFF60" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.gridItemContent}>
            <Text style={styles.fileName} numberOfLines={2}>
              {file.name}
            </Text>
            <Text style={styles.fileSize}>
              {formatFileSize(file.size)}
            </Text>
            <Text style={styles.fileDate}>
              {formatTimeAgo(file.uploadedAt)}
            </Text>
          </View>

          <View style={styles.gridItemFooter}>
            <View style={styles.fileStats}>
              <Download size={10} color="#FFFFFF60" />
              <Text style={styles.downloadCount}>{file.downloadCount}</Text>
            </View>
            {file.sharedWith.length > 0 && (
              <View style={styles.shareIndicator}>
                <User size={10} color="#00FF94" />
                <Text style={styles.shareCount}>{file.sharedWith.length}</Text>
              </View>
            )}
          </View>
        </BlurView>
      </TouchableOpacity>
    );
  };

  const FileListItem = ({ file }: { file: SecureFile }) => {
    const isSelected = selectedFiles.has(file.id);
    const encryptionColor = getEncryptionColor(file.encryptionLevel);

    return (
      <TouchableOpacity
        style={[styles.listItem, isSelected && styles.listItemSelected]}
        onPress={() => onPreview(file.id)}
      >
        <BlurView intensity={20} style={styles.listItemBlur}>
          <View style={styles.listItemLeft}>
            {file.thumbnail ? (
              <Image source={{ uri: file.thumbnail }} style={styles.listThumbnail} />
            ) : (
              <View style={styles.listIconContainer}>
                {getFileIcon(file.type, 20)}
              </View>
            )}
            
            <View style={styles.listItemInfo}>
              <Text style={styles.listFileName} numberOfLines={1}>
                {file.name}
              </Text>
              <View style={styles.listItemMeta}>
                <Text style={styles.listFileSize}>
                  {formatFileSize(file.size)}
                </Text>
                <Text style={styles.listFileDate}>
                  • {formatTimeAgo(file.uploadedAt)}
                </Text>
                <Text style={styles.listUploadedBy}>
                  • by {file.uploadedBy}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.listItemRight}>
            <View style={styles.listItemBadges}>
              <View style={[styles.listEncryptionBadge, { backgroundColor: encryptionColor }]}>
                <Lock size={8} color="#000000" />
              </View>
              {file.sharedWith.length > 0 && (
                <View style={styles.listShareBadge}>
                  <User size={8} color="#00FF94" />
                  <Text style={styles.listShareCount}>{file.sharedWith.length}</Text>
                </View>
              )}
            </View>
            
            <TouchableOpacity style={styles.listActionButton}>
              <MoreVertical size={16} color="#FFFFFF60" />
            </TouchableOpacity>
          </View>
        </BlurView>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Secure Files</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.viewModeButton}
            onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? (
              <List size={20} color="#FFFFFF80" />
            ) : (
              <Grid size={20} color="#FFFFFF80" />
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.uploadButton} onPress={() => Alert.alert('Upload', 'File upload feature')}>
            <Upload size={20} color="#00FF94" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {['all', 'document', 'image', 'video', 'audio'].map(type => (
            <TouchableOpacity
              key={type}
              style={[styles.filterButton, filterType === type && styles.filterButtonActive]}
              onPress={() => setFilterType(type as any)}
            >
              <Text style={[styles.filterButtonText, filterType === type && styles.filterButtonTextActive]}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Files List */}
      <ScrollView style={styles.filesList} showsVerticalScrollIndicator={false}>
        {viewMode === 'grid' ? (
          <View style={styles.gridContainer}>
            {filteredFiles.map(file => (
              <FileGridItem key={file.id} file={file} />
            ))}
          </View>
        ) : (
          <View style={styles.listContainer}>
            {filteredFiles.map(file => (
              <FileListItem key={file.id} file={file} />
            ))}
          </View>
        )}

        {filteredFiles.length === 0 && (
          <BlurView intensity={20} style={styles.emptyState}>
            <File size={48} color="#FFFFFF40" />
            <Text style={styles.emptyTitle}>No Files Found</Text>
            <Text style={styles.emptySubtitle}>
              Upload files or adjust your filters
            </Text>
          </BlurView>
        )}
      </ScrollView>

      {/* Selection Actions */}
      {selectedFiles.size > 0 && (
        <BlurView intensity={20} style={styles.selectionActions}>
          <Text style={styles.selectionCount}>
            {selectedFiles.size} selected
          </Text>
          <View style={styles.selectionButtons}>
            <TouchableOpacity style={styles.selectionButton}>
              <Download size={16} color="#00FF94" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.selectionButton}>
              <Share size={16} color="#00D4FF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.selectionButton}>
              <Trash2 size={16} color="#FF4444" />
            </TouchableOpacity>
          </View>
        </BlurView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewModeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  uploadButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 255, 148, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#00FF94',
  },
  filtersContainer: {
    marginBottom: 20,
  },
  filterScroll: {
    flexDirection: 'row',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: 'rgba(0, 255, 148, 0.2)',
    borderColor: '#00FF94',
  },
  filterButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF60',
  },
  filterButtonTextActive: {
    color: '#00FF94',
  },
  filesList: {
    flex: 1,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: (width - 60) / 2,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  gridItemSelected: {
    borderWidth: 2,
    borderColor: '#00FF94',
  },
  gridItemBlur: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  gridItemHeader: {
    position: 'relative',
    marginBottom: 8,
  },
  fileThumbnail: {
    width: '100%',
    height: 80,
    borderRadius: 8,
  },
  fileIconContainer: {
    width: '100%',
    height: 80,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileActions: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  encryptionBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  fileActionButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    padding: 4,
  },
  gridItemContent: {
    marginBottom: 8,
  },
  fileName: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF60',
    marginBottom: 2,
  },
  fileDate: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF60',
  },
  gridItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fileStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  downloadCount: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF60',
    marginLeft: 4,
  },
  shareIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shareCount: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#00FF94',
    marginLeft: 2,
  },
  listContainer: {
    flex: 1,
  },
  listItem: {
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  listItemSelected: {
    borderWidth: 2,
    borderColor: '#00FF94',
  },
  listItemBlur: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  listThumbnail: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
  },
  listIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  listItemInfo: {
    flex: 1,
  },
  listFileName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  listItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listFileSize: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF60',
  },
  listFileDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF60',
  },
  listUploadedBy: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF60',
  },
  listItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listItemBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  listEncryptionBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  listShareBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 148, 0.2)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 8,
  },
  listShareCount: {
    fontSize: 8,
    fontFamily: 'Inter-Bold',
    color: '#00FF94',
    marginLeft: 2,
  },
  listActionButton: {
    padding: 4,
  },
  emptyState: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF60',
    textAlign: 'center',
  },
  selectionActions: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectionCount: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  selectionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});