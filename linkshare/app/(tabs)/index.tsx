// App.tsx
import React, { useState, useEffect, useMemo } from 'react';
import * as Linking from 'expo-linking';
import { 
  View, 
  Text, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  ActivityIndicator, 
  Alert,
  Animated,
  Easing,
  FlatList
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import * as Haptics from 'expo-haptics';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';

interface PreviewData {
  id: string;
  title: string;
  url: string;
  image?: string;
  video?: string;
  platform: string;
  date: string;
  domain: string;
  category: string;
  description: string;
  tags: string[];
  animValue?: Animated.Value;
}

const platformIcons: Record<string, JSX.Element> = {
  'instagram.com': <FontAwesome5 name="instagram" size={20} color="#E1306C" />,
  'youtube.com': <FontAwesome5 name="youtube" size={20} color="#FF0000" />,
  'facebook.com': <FontAwesome5 name="facebook" size={20} color="#1877F2" />,
  'twitter.com': <FontAwesome5 name="twitter" size={20} color="#1DA1F2" />,
  'tiktok.com': <FontAwesome5 name="tiktok" size={20} color="#000" />,
  'vimeo.com': <FontAwesome5 name="vimeo" size={20} color="#1AB7EA" />,
};

const categoryIcons: Record<string, { icon: string; color: string }> = {
  cooking: { icon: 'restaurant', color: '#FF6B35' },
  funny: { icon: 'happy', color: '#FFD23F' },
  tutorial: { icon: 'school', color: '#4ECDC4' },
  music: { icon: 'musical-notes', color: '#FF006E' },
  travel: { icon: 'airplane', color: '#8338EC' },
  sports: { icon: 'fitness', color: '#FB5607' },
  gaming: { icon: 'game-controller', color: '#3A86FF' },
  lifestyle: { icon: 'leaf', color: '#06FFA5' },
  tech: { icon: 'hardware-chip', color: '#FFBE0B' },
  other: { icon: 'film', color: '#8B5CF6' }
};

const categories = Object.keys(categoryIcons);

const getPlatformIcon = (domain: string) => {
  return platformIcons[domain] || <Ionicons name="link" size={20} color="#8A8A8F" />;
};

const getCategoryIcon = (category: string) => {
  const cat = categoryIcons[category] || categoryIcons.other;
  return <Ionicons name={cat.icon as any} size={16} color={cat.color} />;
};

const getCategoryColor = (category: string) => {
  return categoryIcons[category]?.color || categoryIcons.other.color;
};

const App = () => {
  const [url, setUrl] = useState('');
  const [previews, setPreviews] = useState<PreviewData[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.9))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const searchAnim = useState(new Animated.Value(0))[0];
  const urlTest = Linking.useURL() || '';
  useEffect(() => {
    // Animation on mount
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      })
    ]).start();

    // Simulate initial saved previews
    const initialPreviews: PreviewData[] = [
      {
        id: '1',
        title: 'Perfect Pasta Carbonara Recipe',
        url: 'https://www.instagram.com/reel/CzXz8YdKjHl/',
        image: 'https://images.unsplash.com/photo-1551782450-17144efb9c50?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80',
        platform: 'Instagram',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        domain: 'instagram.com',
        category: 'cooking',
        description: 'Learn how to make authentic Italian carbonara with this quick recipe',
        tags: ['pasta', 'italian', 'recipe', 'easy']
      },
      {
        id: '2',
        title: 'Funny Cat Compilation 2024',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80',
        platform: 'YouTube',
        date: new Date(Date.now() - 86400000 * 2).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        domain: 'youtube.com',
        category: 'funny',
        description: 'Hilarious cat moments that will make you laugh',
        tags: ['cats', 'funny', 'pets', 'compilation']
      },
      {
        id: '3',
        title: 'React Native Tutorial - Complete Guide',
        url: 'https://www.youtube.com/watch?v=tutorial123',
        image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80',
        platform: 'YouTube',
        date: new Date(Date.now() - 86400000 * 5).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        domain: 'youtube.com',
        category: 'tutorial',
        description: 'Complete React Native tutorial for beginners',
        tags: ['react', 'tutorial', 'coding', 'mobile']
      },
      {
        id: '4',
        title: 'Amazing Travel Destinations',
        url: 'https://www.instagram.com/reel/travel123/',
        image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80',
        platform: 'Instagram',
        date: new Date(Date.now() - 86400000 * 1).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        domain: 'instagram.com',
        category: 'travel',
        description: 'Discover breathtaking travel destinations around the world',
        tags: ['travel', 'destinations', 'adventure', 'nature']
      }
    ];
    setPreviews(initialPreviews);
  }, []);

  // Search and filter logic
  const filteredPreviews = useMemo(() => {
    let filtered = previews;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(preview => 
        preview.title.toLowerCase().includes(query) ||
        preview.description.toLowerCase().includes(query) ||
        preview.tags.some(tag => tag.toLowerCase().includes(query)) ||
        preview.platform.toLowerCase().includes(query) ||
        preview.category.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(preview => preview.category === selectedCategory);
    }

    return filtered;
  }, [previews, searchQuery, selectedCategory]);

  // Search animation
  useEffect(() => {
    if (searchQuery) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        setIsSearching(false);
        Animated.timing(searchAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setIsSearching(false);
      searchAnim.setValue(0);
    }
  }, [searchQuery]);

  const animateNewCard = () => {
    const newCardAnim = new Animated.Value(0);
    Animated.sequence([
      Animated.timing(newCardAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(newCardAnim, {
        toValue: 1.05,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.spring(newCardAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      })
    ]).start();
    
    return newCardAnim;
  };

  const pasteFromClipboard = async () => {
    const text = await Clipboard.getStringAsync();
    if (text) {
      setUrl(text);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const generatePreview = async () => {
    if (!url) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    
    if (!url.match(/^https?:\/\//)) {
      Alert.alert('Invalid URL', 'Please enter a valid URL starting with http:// or https://');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsGenerating(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      // Simulate network request with delay
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const domain = extractDomain(url);
      const newCardAnim = animateNewCard();
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      
      const newPreview: PreviewData = {
        id: Date.now().toString(),
        title: getTitleFromDomain(domain),
        url,
        image: getRandomImage(),
        platform: getPlatformName(domain),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        domain,
        category: randomCategory,
        description: getRandomDescription(randomCategory),
        tags: getRandomTags(randomCategory)
      };
      
      setPreviews(prev => [{
        ...newPreview,
        animValue: newCardAnim
      }, ...prev]);
      setUrl('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate preview. Please try again.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsGenerating(false);
    }
  };

  const extractDomain = (url: string): string => {
    const domain = url.match(/:\/\/(?:www\.)?([^\/]+)/i)?.[1] || '';
    return domain.startsWith('www.') ? domain.substring(4) : domain;
  };

  const getPlatformName = (domain: string): string => {
    const platformMap: Record<string, string> = {
      'instagram.com': 'Instagram',
      'youtube.com': 'YouTube',
      'youtu.be': 'YouTube',
      'facebook.com': 'Facebook',
      'twitter.com': 'Twitter',
      'tiktok.com': 'TikTok',
      'vimeo.com': 'Vimeo',
    };
    return platformMap[domain] || domain;
  };

  const getTitleFromDomain = (domain: string): string => {
    const titles: Record<string, string> = {
      'instagram.com': 'Instagram Video',
      'youtube.com': 'YouTube Video',
      'facebook.com': 'Facebook Video',
      'twitter.com': 'Twitter Video',
      'tiktok.com': 'TikTok Video',
      'vimeo.com': 'Vimeo Video',
    };
    return titles[domain] || 'Shared Video';
  };

  const getRandomImage = (): string => {
    const images = [
      'https://images.unsplash.com/photo-1501854140801-50d01698950b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80',
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80',
      'https://images.unsplash.com/photo-1433086966358-54859d0ed716?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80',
      'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80',
      'https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80',
    ];
    return images[Math.floor(Math.random() * images.length)];
  };

  const getRandomDescription = (category: string): string => {
    const descriptions: Record<string, string[]> = {
      cooking: ['Delicious recipe tutorial', 'Easy cooking guide', 'Professional chef tips'],
      funny: ['Hilarious moments compilation', 'Comedy gold content', 'Laugh-out-loud videos'],
      tutorial: ['Step-by-step guide', 'Learn something new', 'Educational content'],
      music: ['Amazing musical performance', 'Latest music trends', 'Artist spotlight'],
      travel: ['Breathtaking destinations', 'Travel adventure', 'Explore the world'],
      sports: ['Athletic highlights', 'Sports training tips', 'Game analysis'],
      gaming: ['Epic gaming moments', 'Game tutorials', 'Gaming highlights'],
      lifestyle: ['Daily life inspiration', 'Lifestyle tips', 'Personal growth'],
      tech: ['Latest technology trends', 'Tech reviews', 'Innovation showcase'],
      other: ['Interesting content', 'Must-watch video', 'Trending now']
    };
    
    const categoryDescriptions = descriptions[category] || descriptions.other;
    return categoryDescriptions[Math.floor(Math.random() * categoryDescriptions.length)];
  };

  const getRandomTags = (category: string): string[] => {
    const tagsByCategory: Record<string, string[]> = {
      cooking: ['recipe', 'food', 'chef', 'kitchen', 'delicious'],
      funny: ['comedy', 'humor', 'entertainment', 'viral', 'laughter'],
      tutorial: ['howto', 'education', 'learning', 'guide', 'tips'],
      music: ['song', 'artist', 'melody', 'performance', 'audio'],
      travel: ['adventure', 'destination', 'explore', 'journey', 'culture'],
      sports: ['fitness', 'training', 'athlete', 'competition', 'health'],
      gaming: ['game', 'player', 'esports', 'strategy', 'fun'],
      lifestyle: ['daily', 'inspiration', 'wellness', 'personal', 'growth'],
      tech: ['technology', 'innovation', 'digital', 'gadget', 'future'],
      other: ['trending', 'popular', 'viral', 'interesting', 'new']
    };
    
    const categoryTags = tagsByCategory[category] || tagsByCategory.other;
    return categoryTags.slice(0, Math.floor(Math.random() * 3) + 2);
  };

  const removePreview = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPreviews(previews.filter(preview => preview.id !== id));
  };

  const sharePreview = (previewUrl: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Sharing.shareAsync(previewUrl);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSelectedCategory(null);
  };

  const renderCategoryFilter = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.categoryContainer}
      contentContainerStyle={styles.categoryContent}
    >
      <TouchableOpacity
        style={[styles.categoryChip, !selectedCategory && styles.categoryChipActive]}
        onPress={() => setSelectedCategory(null)}
        activeOpacity={0.7}
      >
        <Text style={[styles.categoryText, !selectedCategory && styles.categoryTextActive]}>
          All
        </Text>
      </TouchableOpacity>
      
      {categories.map(category => (
        <TouchableOpacity
          key={category}
          style={[
            styles.categoryChip,
            selectedCategory === category && styles.categoryChipActive,
            selectedCategory === category && { borderColor: getCategoryColor(category) }
          ]}
          onPress={() => setSelectedCategory(selectedCategory === category ? null : category)}
          activeOpacity={0.7}
        >
          <View style={styles.categoryChipContent}>
            {getCategoryIcon(category)}
            <Text style={[
              styles.categoryText,
              selectedCategory === category && styles.categoryTextActive
            ]}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderPreviewCard = ({ item: preview, index }: { item: PreviewData; index: number }) => (
    <Animated.View 
      style={[
        styles.previewCard,
        preview.animValue && {
          transform: [{ scale: preview.animValue }],
          opacity: preview.animValue
        }
      ]}
    >
      <View style={styles.previewImageContainer}>
        {preview.image ? (
          <Image 
            source={{ uri: preview.image }} 
            style={styles.previewImage} 
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <MaterialIcons name="videocam" size={36} color="#8A8A8F" />
          </View>
        )}
        <View style={styles.platformBadge}>
          {getPlatformIcon(preview.domain)}
        </View>
        <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(preview.category) + '20' }]}>
          <View style={styles.categoryBadgeContent}>
            {getCategoryIcon(preview.category)}
            <Text style={[styles.categoryBadgeText, { color: getCategoryColor(preview.category) }]}>
              {preview.category.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.previewContent}>
        <Text style={styles.previewTitle} numberOfLines={2}>
          {preview.title}
        </Text>
        
        <Text style={styles.previewDescription} numberOfLines={2}>
          {preview.description}
        </Text>
        
        <View style={styles.tagsContainer}>
          {preview.tags.slice(0, 3).map((tag, tagIndex) => (
            <View key={tagIndex} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>
        
        <Text style={styles.previewUrl} numberOfLines={1}>
          {preview.url}
        </Text>
        
        <View style={styles.previewFooter}>
          <View style={styles.dateContainer}>
            <Ionicons name="time-outline" size={14} color="#636366" />
            <Text style={styles.previewDate}>{preview.date}</Text>
          </View>
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => sharePreview(preview.url)}
              activeOpacity={0.7}
            >
              <Ionicons name="share-outline" size={20} color="#8A8A8F" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => removePreview(preview.id)}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={20} color="#FF453A" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
      <LinearGradient
        colors={['#0A0A0A', '#1A1A1A']}
        style={styles.gradient}
      >
        {/* Header */}
        <Animated.View style={[styles.header, { transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.headerTitle}>VideoLink</Text>
           <Text>Fahad Akash {urlTest}</Text>
          <Text style={styles.headerSubtitle}>Save, search & organize video links</Text>
        </Animated.View>

        {/* Search Bar */}
        <Animated.View style={[styles.searchContainer, { transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#8A8A8F" style={styles.searchIcon} />
           
            <TextInput
              style={styles.searchInput}
              placeholder="Search videos, categories, tags..."
              placeholderTextColor="#8A8A8F"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardAppearance="dark"
              selectionColor="#636366"
            />
            {searchQuery ? (
              <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                <Ionicons name="close-circle" size={20} color="#8A8A8F" />
              </TouchableOpacity>
            ) : null}
          </View>
          {isSearching && (
            <View style={styles.searchLoader}>
              <ActivityIndicator size="small" color="#8A8A8F" />
            </View>
          )}
        </Animated.View>

        {/* Category Filter */}
        <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
          {renderCategoryFilter()}
        </Animated.View>

        {/* Input Section */}
        <Animated.View style={[styles.inputContainer, { transform: [{ translateY: slideAnim }] }]}>
          <TextInput
            style={styles.input}
            placeholder="Paste video URL here..."
            placeholderTextColor="#8A8A8F"
            value={url}
            onChangeText={setUrl}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardAppearance="dark"
            selectionColor="#636366"
          />
          <TouchableOpacity 
            style={styles.pasteButton} 
            onPress={pasteFromClipboard}
            activeOpacity={0.7}
          >
            <Ionicons name="clipboard-outline" size={20} color="#FFF" />
          </TouchableOpacity>
        </Animated.View>
        
        <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
          <TouchableOpacity 
            style={[styles.generateButton, isGenerating && styles.generateButtonDisabled]} 
            onPress={generatePreview}
            disabled={isGenerating}
            activeOpacity={0.7}
          >
            {isGenerating ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Ionicons name="add-circle-outline" size={20} color="#FFF" style={styles.generateIcon} />
                <Text style={styles.generateButtonText}>Add Preview</Text>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Results Header */}
        {searchQuery || selectedCategory ? (
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsText}>
              {filteredPreviews.length} result{filteredPreviews.length !== 1 ? 's' : ''} found
            </Text>
            {(searchQuery || selectedCategory) && (
              <TouchableOpacity onPress={clearSearch} style={styles.clearAllButton}>
                <Text style={styles.clearAllText}>Clear all</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : null}

        {/* Preview Cards */}
        <View style={styles.previewContainer}>
          {filteredPreviews.length === 0 ? (
            <Animated.View style={[styles.emptyState, { opacity: fadeAnim }]}>
              <MaterialIcons 
                name={searchQuery || selectedCategory ? "search-off" : "videocam-off"} 
                size={48} 
                color="#8A8A8F" 
              />
              <Text style={styles.emptyStateText}>
                {searchQuery || selectedCategory ? 'No results found' : 'No previews yet'}
              </Text>
              <Text style={styles.emptyStateSubtext}>
                {searchQuery || selectedCategory 
                  ? 'Try adjusting your search or filters' 
                  : 'Paste a video URL to get started'
                }
              </Text>
            </Animated.View>
          ) : (
            <FlatList
              data={filteredPreviews}
              renderItem={renderPreviewCard}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.previewContentContainer}
            />
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>VideoLink • v2.0 • {previews.length} videos saved</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  gradient: {
    flex: 1,
    paddingTop: Constants.statusBarHeight + 20,
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#8A8A8F',
    fontWeight: '500',
  },
  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
    paddingVertical: 16,
  },
  clearButton: {
    padding: 4,
  },
  searchLoader: {
    position: 'absolute',
    right: 16,
    top: 18,
  },
  categoryContainer: {
    marginBottom: 16,
  },
  categoryContent: {
    paddingHorizontal: 24,
    paddingRight: 48,
  },
  categoryChip: {
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  categoryChipActive: {
    backgroundColor: '#2C2C2E',
    borderColor: '#48484A',
  },
  categoryChipContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryText: {
    color: '#8A8A8F',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  categoryTextActive: {
    color: '#FFF',
  },
  inputContainer: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    color: '#FFF',
    padding: 16,
    borderRadius: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  pasteButton: {
    backgroundColor: '#2C2C2E',
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  generateButton: {
    backgroundColor: '#3A3A3C',
    padding: 16,
    borderRadius: 14,
    marginHorizontal: 24,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#48484A',
  },
  generateButtonDisabled: {
    opacity: 0.7,
  },
  generateButtonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '600',
  },
  generateIcon: {
    marginRight: 8,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  resultsText: {
    color: '#8A8A8F',
    fontSize: 14,
    fontWeight: '600',
  },
  clearAllButton: {
    backgroundColor: '#2C2C2E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  clearAllText: {
    color: '#FF453A',
    fontSize: 12,
    fontWeight: '600',
  },
  previewContainer: {
    flex: 1,
  },
  previewContentContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  previewCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  previewImageContainer: {
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: 220,
    backgroundColor: '#2C2C2E',
  },
  imagePlaceholder: {
    width: '100%',
    height: 220,
    backgroundColor: '#2C2C2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  platformBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(28, 28, 30, 0.95)',
    padding: 8,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  categoryBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoryBadgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  previewContent: {
    padding: 20,
  },
  previewTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    lineHeight: 26,
  },
  previewDescription: {
    color: '#CCCCCC',
    fontSize: 15,
    marginBottom: 12,
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#2C2C2E',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  tagText: {
    color: '#8A8A8F',
    fontSize: 12,
    fontWeight: '600',
  },
  previewUrl: {
    color: '#636366',
    fontSize: 13,
    marginBottom: 16,
  },
  previewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewDate: {
    color: '#636366',
    fontSize: 13,
    marginLeft: 6,
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
  },
  iconButton: {
    padding: 10,
    marginLeft: 8,
    borderRadius: 20,
    backgroundColor: '#2C2C2E',
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  emptyState: {
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2C2C2E',
    marginHorizontal: 24,
    marginTop: 60,
  },
  emptyStateText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 20,
  },
  emptyStateSubtext: {
    color: '#8A8A8F',
    fontSize: 15,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
    marginTop: 16,
  },
  footerText: {
    color: '#636366',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default App;