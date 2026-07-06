// components/YouTubeStyleMenu.tsx
import React, { useState, useEffect, useRef } from "react";
import type { YouTubeStyleMenuProps } from "./types";

const YouTubeStyleMenu: React.FC<YouTubeStyleMenuProps> = ({
  menuData,
  primaryColor = "#2563eb",
  backgroundColor = "#ffffff",
  textColor = "#1e293b",
  hoverColor = "#f1f5f9",
  isCollapsible = true,
  appName = "App Menu",
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const menuContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if mobile on mount and resize
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!document.querySelector('link[href*="font-awesome"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href =
        "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
      link.crossOrigin = "anonymous";
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    // Check if content is scrollable
    const checkScroll = () => {
      if (menuContentRef.current) {
        const { scrollHeight, clientHeight } = menuContentRef.current;
        setShowScrollIndicator(scrollHeight > clientHeight);
      }
    };

    checkScroll();
    window.addEventListener('resize', checkScroll);
    
    return () => {
      window.removeEventListener('resize', checkScroll);
    };
  }, [menuData, isCollapsed]);

  const toggleMenu = () => {
    if (isCollapsible) {
      setIsCollapsed(!isCollapsed);
    }
  };

  const handleItemClick = (link?: string) => {
    if (link) {
      window.location.href = link;
    }
  };

  const handleIconHover = (e: React.MouseEvent, itemId: string | null) => {
    setHoveredItem(itemId);
    if (itemId && isCollapsed) {
      const rect = e.currentTarget.getBoundingClientRect();
      setTooltipPosition({
        top: rect.top + window.scrollY,
        left: rect.right + window.scrollX + 8,
      });
    }
  };

  const scrollToBottom = () => {
    if (menuContentRef.current) {
      menuContentRef.current.scrollTo({
        top: menuContentRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  const Tooltip = () => {
    if (!hoveredItem || !isCollapsed) return null;
    const item = menuData.find((section) => section.id === hoveredItem);
    if (!item) return null;

    return (
      <div
        className="fixed bg-gray-900/95 text-white text-sm py-2 px-3 rounded-lg shadow-lg z-50 backdrop-blur-sm transition-opacity duration-200"
        style={{
          top: `${tooltipPosition.top}px`,
          left: `${tooltipPosition.left}px`,
        }}
      >
        {item.title}
      </div>
    );
  };

  // Mobile menu state
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="fixed top-4 left-4 z-50 p-3 rounded-full bg-white shadow-lg md:hidden"
          style={{ color: primaryColor }}
          aria-label="Toggle menu"
        >
          <i className={`fas ${isMobileOpen ? 'fa-times' : 'fa-bars'}`}></i>
        </button>
      )}

      {/* Desktop/Mobile Menu */}
      <div
        className={`
          fixed md:relative h-full transition-all duration-300 ease-in-out shadow-lg z-40
          ${isCollapsed ? "w-16" : "w-64"}
          ${isMobile ? (isMobileOpen ? "left-0" : "-left-64") : "left-0"}
          rounded-r-xl overflow-hidden border-r border-gray-200
        `}
        style={{
          background: backgroundColor,
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 border-b"
          style={{
            borderColor: hoverColor,
            background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`,
            minHeight: "64px"
          }}
        >
          {!isCollapsed && (
            <span className="text-lg font-bold text-white">
              {appName}
            </span>
          )}
          {isCollapsible && (
            <button
              onClick={toggleMenu}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors duration-200"
              aria-label={isCollapsed ? "Expand menu" : "Collapse menu"}
            >
              <i className={`text-sm ${isCollapsed ? "fas fa-chevron-right" : "fas fa-chevron-left"}`}></i>
            </button>
          )}
        </div>

        {/* Menu Items Container with Scroll */}
        <div className="relative">
          {/* Scroll Indicator (Top) - Only show when scrolled down */}
          <div 
            className="absolute top-0 left-0 right-0 h-4 flex items-center justify-center opacity-0 transition-opacity duration-300 pointer-events-none"
            style={{
              background: `linear-gradient(to bottom, ${backgroundColor} 0%, transparent 100%)`,
            }}
          />
          
          {/* Menu Items */}
          <div
            ref={menuContentRef}
            className="overflow-y-auto py-4 custom-scrollbar"
            style={{ 
              height: "calc(100vh - 128px)",
              maxHeight: "calc(100vh - 128px)"
            }}
          >
            <nav className="space-y-1 px-2">
              {menuData.map((section) => (
                <div
                  key={section.id}
                  className={`
                    group flex items-center p-3 my-1 rounded-xl cursor-pointer transition-all duration-200
                    hover:scale-[1.02] hover:shadow-md transform origin-left
                    ${hoveredItem === section.id ? 'scale-[1.02] shadow-md' : ''}
                  `}
                  style={{ 
                    color: textColor,
                    backgroundColor: hoveredItem === section.id ? `${primaryColor}15` : "transparent",
                    borderLeft: hoveredItem === section.id ? `4px solid ${primaryColor}` : '4px solid transparent'
                  }}
                  onMouseEnter={(e) => handleIconHover(e, section.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  onClick={() => handleItemClick(section.link)}
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 group-hover:from-blue-100 group-hover:to-blue-200">
                    <i
                      className={`${section.icon} text-base`}
                      style={{ color: primaryColor }}
                    ></i>
                  </div>
                  
                  {!isCollapsed && (
                    <div className="ml-4 flex-1">
                      <span className="text-sm font-medium block">
                        {section.title}
                      </span>
                      {section.link && (
                        <span className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          {section.link.replace('/maintenance/', '')}
                        </span>
                      )}
                    </div>
                  )}

                  {!isCollapsed && section.link && (
                    <i className="fas fa-chevron-right text-xs text-gray-400 group-hover:text-gray-600 transition-colors"></i>
                  )}
                </div>
              ))}
            </nav>

            {/* Collapsed state indicator */}
            {isCollapsed && (
              <div className="px-3 mt-8 text-center">
                <div className="w-8 h-8 mx-auto rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                <i className="fas fa-ellipsis-h text-xs" style={{ color: primaryColor }}></i>
                </div>
              </div>
            )}
          </div>

          {/* Scroll Indicator (Bottom) */}
          {showScrollIndicator && (
            <div 
              className="absolute bottom-0 left-0 right-0 h-6 flex items-center justify-center transition-opacity duration-300"
              style={{
                background: `linear-gradient(to top, ${backgroundColor} 0%, transparent 100%)`,
              }}
            >
              <button 
                onClick={scrollToBottom}
                className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                aria-label="Scroll to bottom"
              >
                <i className="fas fa-chevron-down text-xs" style={{ color: textColor }}></i>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {!isCollapsed && (
          <div 
            className="border-t p-4"
            style={{
              borderColor: hoverColor,
            }}
          >
            <div className="text-center">
              <div 
                className="w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2"
                style={{
                  background: `linear-gradient(to bottom, ${primaryColor}15, ${primaryColor}30)`,
                }}
              >
                <i className="fas fa-user text-sm" style={{ color: primaryColor }}></i>
              </div>
              <p className="text-xs" style={{ color: textColor }}>Maintenance Portal</p>
              <p className="text-xs mt-1" style={{ color: textColor, opacity: 0.7 }}>v2.0.1</p>
            </div>
          </div>
        )}
      </div>

      {/* Overlay for mobile */}
      {isMobile && isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-30 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <Tooltip />
    </>
  );
};

export default YouTubeStyleMenu;