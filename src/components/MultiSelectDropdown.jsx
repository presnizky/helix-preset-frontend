import {
  KeyboardArrowDown as ArrowDownIcon
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  FormControl,
  Menu,
  MenuItem,
  Typography
} from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';

const MultiSelectDropdown = ({
  label,
  options = [],
  value = [],
  onChange,
  placeholder = "Select options",
  maxHeight = 200,
  maxDisplayItems = 2,
  disabled = false,
  ...props
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [open, setOpen] = useState(false);
  const buttonRef = useRef(null);

  const handleClick = (event) => {
    if (!disabled) {
      setAnchorEl(event.currentTarget);
      setOpen(true);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setAnchorEl(null);
  };

  const handleSelect = (optionValue) => {
    if (!disabled) {
      const newValue = value.includes(optionValue)
        ? value.filter(item => item !== optionValue)
        : [...value, optionValue];
      
      onChange(newValue);
    }
  };

  const handleSelectAll = () => {
    if (!disabled) {
      if (value.length === options.length) {
        onChange([]);
      } else {
        onChange(options.map(option => option.value || option.id));
      }
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target) && 
          anchorEl && !anchorEl.contains(event.target)) {
        handleClose();
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          handleClose();
        }
      });
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, anchorEl]);

  const getDisplayText = () => {
    if (value.length === 0) {
      return placeholder;
    }
    
    const selectedOptions = options.filter(option => 
      value.includes(option.value || option.id)
    );
    
    if (selectedOptions.length <= maxDisplayItems) {
      return selectedOptions.map(option => option.label || option.name).join(', ');
    }
    
    return `${selectedOptions.slice(0, maxDisplayItems).map(option => option.label || option.name).join(', ')} +${selectedOptions.length - maxDisplayItems}`;
  };

  const handleRemoveItem = (itemValue, event) => {
    event.stopPropagation(); // Prevent dropdown from opening
    const newValue = value.filter(v => v !== itemValue);
    onChange(newValue);
  };

  const getSelectedChips = () => {
    if (value.length === 0) return null;
    
    const selectedOptions = options.filter(option => 
      value.includes(option.value || option.id)
    );
    
    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxHeight: 40, overflow: 'hidden' }}>
        {selectedOptions.slice(0, maxDisplayItems).map((option) => (
          <Chip 
            key={option.value || option.id} 
            label={option.label || option.name} 
            size="small" 
            deleteIcon={
              <Typography sx={{ fontSize: '0.7rem', color: '#e74c3c', fontWeight: 500 }}>
                ×
              </Typography>
            }
            onDelete={(event) => handleRemoveItem(option.value || option.id, event)}
            sx={{ 
              fontSize: '0.75rem',
              '& .MuiChip-deleteIcon': {
                '&:hover': {
                  backgroundColor: '#e74c3c',
                  color: 'white',
                  borderRadius: '50%'
                }
              }
            }}
          />
        ))}
        {selectedOptions.length > maxDisplayItems && (
          <Chip 
            label={`+${selectedOptions.length - maxDisplayItems}`} 
            size="small" 
            sx={{ fontSize: '0.75rem' }}
          />
        )}
      </Box>
    );
  };

  return (
    <FormControl fullWidth size="small" {...props}>
      <Button
        ref={buttonRef}
        onClick={handleClick}
        variant="outlined"
        fullWidth
        endIcon={<ArrowDownIcon />}
        disabled={disabled}
        sx={{
          justifyContent: 'space-between',
          textAlign: 'left',
          textTransform: 'none',
          minHeight: 40,
          borderColor: open ? 'primary.main' : 'rgba(0, 0, 0, 0.23)',
          '&:hover': {
            borderColor: 'primary.main',
          },
          paddingTop: '16px',
          paddingBottom: '16px',
          ...(value.length > 0 && {
            '& .MuiButton-startIcon': {
              display: 'none'
            }
          })
        }}
      >
        <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
          {value.length > 0 ? getSelectedChips() : (
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'text.secondary',
                textAlign: 'left',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {getDisplayText()}
            </Typography>
          )}
        </Box>
      </Button>
      
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          style: {
            maxHeight: maxHeight,
            width: anchorEl ? anchorEl.offsetWidth : 280,
          },
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        {options.length > 1 && (
          <MenuItem onClick={handleSelectAll} dense>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
              {value.length === options.length ? 'Deselect All' : 'Select All'}
            </Typography>
          </MenuItem>
        )}
        {options.map((option) => {
          const optionValue = option.value || option.id;
          const isSelected = value.includes(optionValue);
          
          return (
            <MenuItem 
              key={optionValue} 
              onClick={() => handleSelect(optionValue)}
              dense
              selected={isSelected}
              sx={{
                backgroundColor: isSelected ? 'action.selected' : 'transparent',
                '&:hover': {
                  backgroundColor: isSelected ? 'action.selected' : 'action.hover',
                }
              }}
            >
              <Typography variant="body2">
                {option.label || option.name}
              </Typography>
            </MenuItem>
          );
        })}
      </Menu>
    </FormControl>
  );
};

export default MultiSelectDropdown;
