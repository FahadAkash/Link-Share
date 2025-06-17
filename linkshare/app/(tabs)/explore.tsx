import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Image,
  ActivityIndicator, Animated, Easing, FlatList, Dimensions
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5, Entypo } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import CalendarStrip from 'react-native-calendar-strip';
import moment from 'moment';

const { width } = Dimensions.get('window');

interface VideoItem {
  id: string;
  title: string;
  url: string;
  image: string;
  platform: string;
  date: Date;
  domain: string;
  category: string;
  description: string;
  tags: string[];
  folderId?: string;
  reminder?: Date;
  isFavorite: boolean;
}

interface Folder {
  id: string;
  name: string;
  color: string;
  icon: string;
}

const platformIcons: Record<string, JSX.Element> = {
  'instagram.com': <FontAwesome5 name="instagram" size={16} color="#E1306C" />,
  'youtube.com': <FontAwesome5 name="youtube" size={16} color="#FF0000" />,
  'facebook.com': <FontAwesome5 name="facebook" size={16} color="#1877F2" />,
  'twitter.com': <FontAwesome5 name="twitter" size={16} color="#1DA1F2" />,
  'tiktok.com': <FontAwesome5 name="tiktok" size={16} color="#000" />,
  'vimeo.com': <FontAwesome5 name="vimeo" size={16} color="#1AB7EA" />,
};

const folderIcons: Record<string, JSX.Element> = {
  favorites: <Ionicons name="heart" size={20} color="#FF453A" />,
  tutorials: <Ionicons name="school" size={20} color="#4ECDC4" />,
  entertainment: <Ionicons name="film" size={20} color="#FFD23F" />,
  inspiration: <Ionicons name="sparkles" size={20} color="#FFBE0B" />,
  learning: <Ionicons name="book" size={20} color="#3A86FF" />,
};

const FavoriteButton = ({ isFavorite, onPress }: { isFavorite: boolean; onPress: () => void }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    onPress();
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Ionicons
          name={isFavorite ? "heart" : "heart-outline"}
          size={20}
          color={isFavorite ? "#FF453A" : "#8A8A8F"}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

const VideoOrganizerApp = () => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);
  const [isMovingVideo, setIsMovingVideo] = useState(false);
  const [movingVideoId, setMovingVideoId] = useState<string | null>(null);
  const [isFoldersModalVisible, setIsFoldersModalVisible] = useState(false);

  const folderColors = ['#FF6B35', '#4ECDC4', '#FFD23F', '#8338EC', '#3A86FF'];
  const folderNames = ['Favorites', 'Tutorials', 'Entertainment', 'Inspiration', 'Learning'];

  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setTimeout(() => {
      const initialFolders: Folder[] = folderNames.map((name, index) => ({
        id: `folder-${index}`,
        name,
        color: folderColors[index % folderColors.length],
        icon: Object.keys(folderIcons)[index % Object.keys(folderIcons).length]
      }));
      setFolders(initialFolders);

      const initialVideos: VideoItem[] = [
        {
          id: '1',
          title: 'Perfect Pasta Carbonara Recipe',
          url: 'https://www.instagram.com/reel/CzXz8YdKjHl/',
          image: 'https://images.unsplash.com/photo-1551782450-17144efb9c50?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80',
          platform: 'Instagram',
          date: new Date(),
          domain: 'instagram.com',
          category: 'cooking',
          description: 'Learn how to make authentic Italian carbonara with this quick recipe',
          tags: ['pasta', 'italian', 'recipe', 'easy'],
          folderId: 'folder-0',
          isFavorite: true
        },
        {
          id: '2',
          title: 'React Native Tutorial - Complete Guide',
          url: 'https://www.youtube.com/watch?v=tutorial123',
          image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80',
          platform: 'YouTube',
          date: new Date(Date.now() - 86400000 * 2),
          domain: 'youtube.com',
          category: 'tutorial',
          description: 'Complete React Native tutorial for beginners',
          tags: ['react', 'tutorial', 'coding', 'mobile'],
          folderId: 'folder-1',
          isFavorite: false
        },
        {
          id: '3',
          title: 'Amazing Travel Destinations',
          url: 'https://www.instagram.com/reel/travel123/',
          image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80',
          platform: 'Instagram',
          date: new Date(Date.now() - 86400000 * 3),
          domain: 'instagram.com',
          category: 'travel',
          description: 'Discover breathtaking travel destinations around the world',
          tags: ['travel', 'destinations', 'adventure', 'nature'],
          folderId: 'folder-3',
          isFavorite: true
        },
        {
          id: '4',
          title: 'Morning Yoga Routine',
          url: 'https://www.youtube.com/watch?v=yoga123',
          image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80',
          platform: 'YouTube',
          date: new Date(Date.now() - 86400000 * 4),
          domain: 'youtube.com',
          category: 'fitness',
          description: 'Start your day with this energizing yoga routine',
          tags: ['yoga', 'fitness', 'morning', 'routine'],
          folderId: 'folder-4',
          isFavorite: false
        },
        {
          id: '5',
          title: 'Minimalist Home Office Setup',
          url: 'https://www.youtube.com/watch?v=office123',
          image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80',
          platform: 'YouTube',
          date: new Date(Date.now() - 86400000 * 5),
          domain: 'youtube.com',
          category: 'lifestyle',
          description: 'Create a productive minimalist home office',
          tags: ['office', 'productivity', 'minimalist', 'setup'],
          folderId: 'folder-2',
          isFavorite: false
        },
        {
          id: '6',
          title: 'Advanced JavaScript Concepts',
          url: 'https://www.youtube.com/watch?v=js123',
          image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80',
          platform: 'YouTube',
          date: new Date(Date.now() - 86400000 * 6),
          domain: 'youtube.com',
          category: 'coding',
          description: 'Master advanced JavaScript concepts with practical examples',
          tags: ['javascript', 'coding', 'web', 'development'],
          folderId: 'folder-1',
          isFavorite: true
        }
      ];
      setVideos(initialVideos);
      setIsLoading(false);
    }, 1500);
  }, []);

  useEffect(() => {
    if (isAddingFolder || isMovingVideo || isFoldersModalVisible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [isAddingFolder, isMovingVideo, isFoldersModalVisible]);

  const filteredVideos = videos.filter(video => {
    if (selectedFolder === 'favorites') {
      if (!video.isFavorite) return false;
    } else if (selectedFolder && video.folderId !== selectedFolder) {
      return false;
    }

    if (showCalendar) {
      const videoDate = new Date(video.date);
      const selected = new Date(selectedDate);
      if (
        videoDate.getDate() !== selected.getDate() ||
        videoDate.getMonth() !== selected.getMonth() ||
        videoDate.getFullYear() !== selected.getFullYear()
      ) return false;
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        video.title.toLowerCase().includes(query) ||
        video.description.toLowerCase().includes(query) ||
        video.tags.some(tag => tag.toLowerCase().includes(query)) ||
        video.category.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const getFolderVideosCount = (folderId: string) => {
    return videos.filter(video => video.folderId === folderId).length;
  };

  const createNewFolder = () => {
    if (!newFolderName.trim()) return;
    const newFolder: Folder = {
      id: `folder-${Date.now()}`,
      name: newFolderName,
      color: folderColors[Math.floor(Math.random() * folderColors.length)],
      icon: Object.keys(folderIcons)[Math.floor(Math.random() * Object.keys(folderIcons).length)]
    };
    setFolders([...folders, newFolder]);
    setNewFolderName('');
    setIsAddingFolder(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const toggleFavorite = (id: string) => {
    setVideos(prevVideos =>
      prevVideos.map(video =>
        video.id === id ? { ...video, isFavorite: !video.isFavorite } : video
      )
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const moveVideoToFolder = (folderId: string | undefined) => {
    setVideos(prevVideos =>
      prevVideos.map(video =>
        video.id === movingVideoId ? { ...video, folderId } : video
      )
    );
    setIsMovingVideo(false);
    setMovingVideoId(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'grid' ? 'list' : 'grid');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const toggleCalendar = () => {
    setShowCalendar(prev => !prev);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const renderFolderItem = (folder: Folder) => (
    <TouchableOpacity
      key={folder.id}
      style={[
        styles.folderItem,
        selectedFolder === folder.id && { backgroundColor: folder.color + '40' }
      ]}
      onPress={() => {
        setSelectedFolder(folder.id);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }}
      activeOpacity={0.8}
    >
      <View style={[styles.folderIcon, { backgroundColor: folder.color + '40' }]}>
        {folderIcons[folder.icon] || <Ionicons name="folder" size={20} color={folder.color} />}
      </View>
      <View style={styles.folderInfo}>
        <Text style={styles.folderName} numberOfLines={1}>{folder.name}</Text>
        <Text style={styles.folderCount}>{getFolderVideosCount(folder.id)} videos</Text>
      </View>
      {selectedFolder === folder.id && (
        <Ionicons name="checkmark-circle" size={20} color={folder.color} />
      )}
    </TouchableOpacity>
  );

  const renderVideoItem = ({ item }: { item: VideoItem }) => (
    <View style={[
      styles.videoCard,
      viewMode === 'grid' ? styles.videoCardGrid : styles.videoCardList
    ]}>
      <View style={styles.videoImageContainer}>
        <Image
          source={{ uri: item.image }}
          style={[styles.videoImage, viewMode === 'list' && { width: 150 }]}
          resizeMode="cover"
        />
        <View style={styles.videoBadge}>
          {platformIcons[item.domain]}
        </View>
      </View>

      <View style={styles.videoContent}>
        <Text style={styles.videoTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.videoDescription} numberOfLines={viewMode === 'grid' ? 2 : 3}>
          {item.description}
        </Text>
        <View style={styles.videoMeta}>
          <Text style={styles.videoDate}>
            {moment(item.date).format('MMM D, h:mm a')}
          </Text>
          <View style={styles.videoActions}>
            <FavoriteButton
              isFavorite={item.isFavorite}
              onPress={() => toggleFavorite(item.id)}
            />
            <TouchableOpacity style={styles.videoActionButton}>
              <Ionicons name="alarm" size={20} color="#8A8A8F" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.videoActionButton}
              onPress={() => {
                setMovingVideoId(item.id);
                setIsMovingVideo(true);
              }}
            >
              <Ionicons name="folder" size={20} color="#8A8A8F" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {viewMode === 'list' && (
        <TouchableOpacity style={styles.folderTag}>
          {folders.find(f => f.id === item.folderId) && (
            <>
              <View style={[styles.folderDot, {
                backgroundColor: folders.find(f => f.id === item.folderId)?.color
              }]} />
              <Text style={styles.folderTagText}>
                {folders.find(f => f.id === item.folderId)?.name}
              </Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0A0A0A', '#1A1A1A']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>VideoLink</Text>
            <Text style={styles.headerSubtitle}>Organize your video collection</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={toggleViewMode} style={styles.actionButton}>
              <Ionicons
                name={viewMode === 'grid' ? "list" : "grid"}
                size={24}
                color="#8A8A8F"
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleCalendar} style={styles.actionButton}>
              <Ionicons
                name={showCalendar ? "calendar" : "calendar-outline"}
                size={24}
                color="#8A8A8F"
              />
            </TouchableOpacity>
          </View>
        </View>

        {showCalendar && (
          <View style={styles.calendarContainer}>
            <CalendarStrip
              scrollable
              selectedDate={selectedDate}
              onDateSelected={(date) => {
                setSelectedDate(date.toDate());
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={styles.calendar}
              calendarColor="#1C1C1E"
              dateNumberStyle={{ color: '#FFF' }}
              dateNameStyle={{ color: '#8A8A8F' }}
              highlightDateNumberStyle={{ color: '#FFF', fontWeight: 'bold' }}
              highlightDateNameStyle={{ color: '#FFF' }}
              daySelectionAnimation={{
                type: 'background',
                duration: 300,
                highlightColor: '#3A86FF',
                animType: 'touch'
              }}
              iconContainer={{ flex: 0.1 }}
            />
          </View>
        )}

        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#8A8A8F" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search videos..."
              placeholderTextColor="#8A8A8F"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardAppearance="dark"
              selectionColor="#636366"
            />
            {searchQuery ? (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={20} color="#8A8A8F" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Folders</Text>
          <TouchableOpacity
            onPress={() => setIsAddingFolder(true)}
            style={styles.addButton}
          >
            <Ionicons name="add" size={20} color="#3A86FF" />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.foldersContainer}
        >
          <TouchableOpacity
            style={[
              styles.folderItem,
              !selectedFolder && { backgroundColor: '#3A86FF40' }
            ]}
            onPress={() => {
              setSelectedFolder(null);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            activeOpacity={0.8}
          >
            <View style={[styles.folderIcon, { backgroundColor: '#3A86FF40' }]}>
              <Ionicons name="albums" size={20} color="#3A86FF" />
            </View>
            <View style={styles.folderInfo}>
              <Text style={styles.folderName}>All Videos</Text>
              <Text style={styles.folderCount}>{videos.length} videos</Text>
            </View>
            {!selectedFolder && (
              <Ionicons name="checkmark-circle" size={20} color="#3A86FF" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.folderItem,
              selectedFolder === 'favorites' && { backgroundColor: '#FF453A40' }
            ]}
            onPress={() => {
              setSelectedFolder('favorites');
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            activeOpacity={0.8}
          >
            <View style={[styles.folderIcon, { backgroundColor: '#FF453A40' }]}>
              <Ionicons name="heart" size={20} color="#FF453A" />
            </View>
            <View style={styles.folderInfo}>
              <Text style={styles.folderName}>Favorites</Text>
              <Text style={styles.folderCount}>
                {videos.filter(v => v.isFavorite).length} videos
              </Text>
            </View>
            {selectedFolder === 'favorites' && (
              <Ionicons name="checkmark-circle" size={20} color="#FF453A" />
            )}
          </TouchableOpacity>

          {folders.map(renderFolderItem)}

          <TouchableOpacity
            style={styles.moreFoldersButton}
            onPress={() => setIsFoldersModalVisible(true)}
            activeOpacity={0.8}
          >
            <View style={styles.folderIcon}>
              <Ionicons name="ellipsis-horizontal" size={20} color="#8A8A8F" />
            </View>
            <Text style={styles.folderName}>More</Text>
          </TouchableOpacity>
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {selectedFolder === 'favorites'
              ? 'Favorites'
              : selectedFolder
              ? folders.find(f => f.id === selectedFolder)?.name || 'Videos'
              : 'All Videos'}
          </Text>
          <Text style={styles.videosCount}>
            {filteredVideos.length} {filteredVideos.length === 1 ? 'video' : 'videos'}
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3A86FF" />
            <Text style={styles.loadingText}>Loading your video collection...</Text>
          </View>
        ) : filteredVideos.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons
              name="videocam-off"
              size={48}
              color="#8A8A8F"
            />
            <Text style={styles.emptyStateText}>No videos found</Text>
            <Text style={styles.emptyStateSubtext}>
              Try changing your filters or adding new videos
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredVideos}
            renderItem={renderVideoItem}
            key={viewMode}
            keyExtractor={item => item.id}
            numColumns={viewMode === 'grid' ? 2 : 1}
            contentContainerStyle={[
              styles.videosContainer,
              viewMode === 'grid' ? styles.gridContainer : null
            ]}
            showsVerticalScrollIndicator={false}
          />
        )}

        {(isAddingFolder || isMovingVideo || isFoldersModalVisible) && (
          <Animated.View
            style={[
              styles.modalContainer,
              {
                transform: [{ translateX: slideAnim }],
                opacity: fadeAnim
              }
            ]}
          >
            {isAddingFolder && (
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Create New Folder</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Folder name"
                  placeholderTextColor="#8A8A8F"
                  value={newFolderName}
                  onChangeText={setNewFolderName}
                  autoFocus
                  selectionColor="#3A86FF"
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.modalButtonCancel}
                    onPress={() => setIsAddingFolder(false)}
                  >
                    <Text style={styles.modalButtonTextCancel}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalButtonConfirm}
                    onPress={createNewFolder}
                    disabled={!newFolderName.trim()}
                  >
                    <Text style={styles.modalButtonTextConfirm}>Create</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            {isMovingVideo && (
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Move to Folder</Text>
                <ScrollView>
                  <TouchableOpacity
                    style={styles.folderOption}
                    onPress={() => moveVideoToFolder(undefined)}
                  >
                    <View style={[styles.folderIcon, { backgroundColor: '#3A86FF40' }]}>
                      <Ionicons name="albums" size={20} color="#3A86FF" />
                    </View>
                    <Text style={styles.folderName}>No Folder</Text>
                    {videos.find(v => v.id === movingVideoId)?.folderId === undefined && (
                      <Ionicons name="checkmark" size={20} color="#3A86FF" />
                    )}
                  </TouchableOpacity>
                  {folders.map(folder => (
                    <TouchableOpacity
                      key={folder.id}
                      style={styles.folderOption}
                      onPress={() => moveVideoToFolder(folder.id)}
                    >
                      <View style={[styles.folderIcon, { backgroundColor: folder.color + '40' }]}>
                        {folderIcons[folder.icon]}
                      </View>
                      <Text style={styles.folderName}>{folder.name}</Text>
                      {videos.find(v => v.id === movingVideoId)?.folderId === folder.id && (
                        <Ionicons name="checkmark" size={20} color={folder.color} />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <TouchableOpacity
                  style={styles.modalButtonCancel}
                  onPress={() => {
                    setIsMovingVideo(false);
                    setMovingVideoId(null);
                  }}
                >
                  <Text style={styles.modalButtonTextCancel}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}
            {isFoldersModalVisible && (
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select Folder</Text>
                <ScrollView>
                  <TouchableOpacity
                    style={styles.folderOption}
                    onPress={() => {
                      setSelectedFolder(null);
                      setIsFoldersModalVisible(false);
                    }}
                  >
                    <View style={[styles.folderIcon, { backgroundColor: '#3A86FF40' }]}>
                      <Ionicons name="albums" size={20} color="#3A86FF" />
                    </View>
                    <Text style={styles.folderName}>All Videos</Text>
                    {selectedFolder === null && (
                      <Ionicons name="checkmark" size={20} color="#3A86FF" />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.folderOption}
                    onPress={() => {
                      setSelectedFolder('favorites');
                      setIsFoldersModalVisible(false);
                    }}
                  >
                    <View style={[styles.folderIcon, { backgroundColor: '#FF453A40' }]}>
                      <Ionicons name="heart" size={20} color="#FF453A" />
                    </View>
                    <Text style={styles.folderName}>Favorites</Text>
                    {selectedFolder === 'favorites' && (
                      <Ionicons name="checkmark" size={20} color="#FF453A" />
                    )}
                  </TouchableOpacity>
                  {folders.map(folder => (
                    <TouchableOpacity
                      key={folder.id}
                      style={styles.folderOption}
                      onPress={() => {
                        setSelectedFolder(folder.id);
                        setIsFoldersModalVisible(false);
                      }}
                    >
                      <View style={[styles.folderIcon, { backgroundColor: folder.color + '40' }]}>
                        {folderIcons[folder.icon]}
                      </View>
                      <Text style={styles.folderName}>{folder.name}</Text>
                      {selectedFolder === folder.id && (
                        <Ionicons name="checkmark" size={20} color={folder.color} />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <TouchableOpacity
                  style={styles.modalButtonCancel}
                  onPress={() => setIsFoldersModalVisible(false)}
                >
                  <Text style={styles.modalButtonTextCancel}>Close</Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        )}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  gradient: {
    flex: 1,
    paddingTop: Constants.statusBarHeight + 16,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#8A8A8F',
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#1C1C1E',
  },
  calendarContainer: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  calendar: {
    height: 100,
    paddingTop: 10,
    paddingBottom: 10,
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 52,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  videosCount: {
    fontSize: 14,
    color: '#8A8A8F',
    fontWeight: '500',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1C1C1E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  foldersContainer: {
    paddingBottom: 8,
    marginBottom: 24,
  },
  folderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 12,
    marginRight: 12,
    width: 240,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  moreFoldersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 12,
    width: 120,
    justifyContent: 'center',
  },
  folderIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  folderInfo: {
    flex: 1,
  },
  folderName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 2,
  },
  folderCount: {
    fontSize: 12,
    color: '#8A8A8F',
  },
  videosContainer: {
    paddingBottom: 24,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  videoCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  videoCardGrid: {
    width: (width - 48) / 2 - 8,
  },
  videoCardList: {
    width: '100%',
    flexDirection: 'row',
  },
  videoImageContainer: {
    position: 'relative',
  },
  videoImage: {
    width: '100%',
    height: 100,
    backgroundColor: '#2C2C2E',
  },
  videoBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(28, 28, 30, 0.9)',
    padding: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  videoContent: {
    padding: 12,
    flex: 1
  },
  videoTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  videoDescription: {
    color: '#8A8A8F',
    fontSize: 14,
    marginBottom: 8,
  },
  videoMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  videoDate: {
    color: '#636366',
    fontSize: 12,
  },
  videoActions: {
    flexDirection: 'row',
    gap: 8,
  },
  videoActionButton: {
    padding: 4,
  },
  folderTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderTopLeftRadius: 12,
    borderBottomRightRadius: 16,
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  folderDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  folderTagText: {
    color: '#8A8A8F',
    fontSize: 12,
    fontWeight: '600',
  },
  modalContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: '#2C2C2E',
    borderRadius: 14,
    padding: 16,
    color: '#FFF',
    fontSize: 16,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  modalButtonCancel: {
    flex: 1,
    backgroundColor: '#2C2C2E',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  modalButtonConfirm: {
    flex: 1,
    backgroundColor: '#3A86FF',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  modalButtonTextCancel: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonTextConfirm: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  folderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    color: '#8A8A8F',
    fontSize: 16,
    marginTop: 20,
  },
  emptyState: {
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2C2C2E',
    marginTop: 20,
  },
  emptyStateText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 20,
  },
  emptyStateSubtext: {
    color: '#8A8A8F',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default VideoOrganizerApp;