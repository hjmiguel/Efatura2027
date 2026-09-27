import React from 'react';
import {
  ArrowUpRight, ArrowDownRight, ShoppingCart, Utensils, Car, Home, Zap, Smartphone,
  GraduationCap, HeartPulse, Plane, Gift, Coffee, Film, Dumbbell, Baby, PawPrint,
  Wallet, Briefcase, TrendingUp, PiggyBank, CreditCard, Receipt, Fuel, Bus, Bike,
  ShoppingBag, Pill, Stethoscope, BookOpen, Music, Gamepad2, DollarSign, Landmark,
  Building2, Droplet, Tv, Wifi, Phone, Shirt, Scissors, Dog, Cat, Wrench, Hammer,
  Banknote, Users, HandCoins,
} from 'lucide-react';

const ICONS = {
  ShoppingCart, Utensils, Car, Home, Zap, Smartphone, GraduationCap, HeartPulse, Plane,
  Gift, Coffee, Film, Dumbbell, Baby, PawPrint, Wallet, Briefcase, TrendingUp, PiggyBank,
  CreditCard, Receipt, Fuel, Bus, Bike, ShoppingBag, Pill, Stethoscope, BookOpen, Music,
  Gamepad2, DollarSign, Landmark, Building2, Droplet, Tv, Wifi, Phone, Shirt, Scissors,
  Dog, Cat, Wrench, Hammer, Banknote, Users, HandCoins,
};

// Renders the category's own lucide icon when available, falling back to a
// generic income/expense arrow when the transaction has no matching category icon.
export default function CategoryIcon({ category, isIncome, className = 'w-5 h-5' }) {
  const Icon = (category?.icon && ICONS[category.icon]) || (isIncome ? ArrowUpRight : ArrowDownRight);
  return <Icon className={className} />;
}