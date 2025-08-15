"use client";

import Image from "next/image";
import { useState } from "react";

interface ProfilePictureProps {
  profilePicture?: string | null;
  firstName: string;
  lastName: string;
  size?: number;
  className?: string;
  showBorder?: boolean;
  borderColor?: string;
  backgroundColor?: string;
  textColor?: string;
}

export default function ProfilePicture({
  profilePicture,
  firstName,
  lastName,
  size = 36,
  className = "",
  showBorder = true,
  borderColor = '#FCCB0A',
  backgroundColor = '#FCCB0A',
  textColor = '#7F1416',
}: ProfilePictureProps) {
  const [imageError, setImageError] = useState(false);
  
  // Get first letter of first name, fallback to first letter of last name
  const firstInitial = (firstName?.charAt(0) || lastName?.charAt(0) || "U").toUpperCase();

  // Validate profile picture URL
  const isValidProfilePicture = profilePicture && 
    (profilePicture.startsWith('/') || 
     profilePicture.startsWith('http://') || 
     profilePicture.startsWith('https://'));

  // If no profile picture, invalid URL, or image failed to load, show initial
  if (!isValidProfilePicture || imageError) {
    return (
      <div
        className={className}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          backgroundColor: backgroundColor,
          color: textColor,
          fontWeight: 'bold',
          fontSize: `${Math.max(size * 0.4, 12)}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 4px rgba(0, 0, 0, 0.2)',
          border: showBorder ? `2px solid ${borderColor}` : 'none',
        }}
      >
        {firstInitial}
      </div>
    );
  }

  // Show profile picture
  return (
    <Image
      src={profilePicture}
      alt={`${firstName} ${lastName}'s profile picture`}
      width={size}
      height={size}
      className={className}
      style={{
        borderRadius: '50%',
        objectFit: 'cover',
        boxShadow: '0 0 4px rgba(0, 0, 0, 0.2)',
        border: showBorder ? `2px solid ${borderColor}` : 'none',
      }}
      onError={() => setImageError(true)}
      priority={false}
      unoptimized={false}
    />
  );
}
