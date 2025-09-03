// Job URL Generator Utility
// This utility creates unique URLs and domain extensions for each job

export interface JobURLConfig {
  jobId: string;
  title: string;
  company?: string;
  location?: string;
}

export class JobURLGenerator {
  private static readonly BASE_DOMAIN = 'anoudjob.com';
  private static readonly SUBDOMAIN_PREFIX = 'job';
  
  /**
   * Generate a unique subdomain for a job
   * Format: job-{uniqueIdentifier}.anoudjob.com
   */
  static generateSubdomain(jobId: string, title: string): string {
    const uniqueId = this.generateUniqueIdentifier(title, jobId);
    return `${this.SUBDOMAIN_PREFIX}-${uniqueId}.${this.BASE_DOMAIN}`;
  }
  
  /**
   * Generate a unique URL path for a job
   * Format: anoudjob.com/jobs/{slug}
   */
  static generateURLPath(jobId: string, title: string): string {
    const slug = this.generateSlug(title);
    return `https://${this.BASE_DOMAIN}/jobs/${slug}`;
  }
  
  /**
   * Generate a custom domain extension for a job
   * Format: {jobTitle}.anoudjob.com
   */
  static generateCustomDomain(jobId: string, title: string): string {
    const cleanTitle = this.generateSlug(title);
    return `${cleanTitle}.${this.BASE_DOMAIN}`;
  }
  
  /**
   * Generate a professional subdomain
   * Format: {company}-{jobTitle}.anoudjob.com
   */
  static generateProfessionalDomain(jobId: string, title: string, company?: string): string {
    const cleanTitle = this.generateSlug(title);
    const cleanCompany = company ? this.generateSlug(company) : 'anoud';
    return `${cleanCompany}-${cleanTitle}.${this.BASE_DOMAIN}`;
  }
  
  /**
   * Generate a location-based domain
   * Format: {location}-{jobTitle}.anoudjob.com
   */
  static generateLocationDomain(jobId: string, title: string, location?: string): string {
    const cleanTitle = this.generateSlug(title);
    const cleanLocation = location ? this.generateSlug(location) : 'saudi';
    return `${cleanLocation}-${cleanTitle}.${this.BASE_DOMAIN}`;
  }
  
  /**
   * Generate a category-based domain
   * Format: {category}-{jobTitle}.anoudjob.com
   */
  static generateCategoryDomain(jobId: string, title: string): string {
    const cleanTitle = this.generateSlug(title);
    const category = this.detectJobCategory(title);
    return `${category}-${cleanTitle}.${this.BASE_DOMAIN}`;
  }
  
  /**
   * Generate a seniority-based domain
   * Format: {seniority}-{jobTitle}.anoudjob.com
   */
  static generateSeniorityDomain(jobId: string, title: string, experience?: string): string {
    const cleanTitle = this.generateSlug(title);
    const seniority = this.detectSeniorityLevel(title, experience);
    return `${seniority}-${cleanTitle}.${this.BASE_DOMAIN}`;
  }
  
  /**
   * Detect job category based on title
   */
  private static detectJobCategory(title: string): string {
    const lowerTitle = title.toLowerCase();
    
    if (lowerTitle.includes('engineer') || lowerTitle.includes('مهندس')) return 'engineering';
    if (lowerTitle.includes('technician') || lowerTitle.includes('فني')) return 'technical';
    if (lowerTitle.includes('sales') || lowerTitle.includes('مبيعات')) return 'sales';
    if (lowerTitle.includes('medical') || lowerTitle.includes('طبي')) return 'medical';
    if (lowerTitle.includes('agricultural') || lowerTitle.includes('زراعي')) return 'agriculture';
    if (lowerTitle.includes('electrical') || lowerTitle.includes('كهربائي')) return 'electrical';
    if (lowerTitle.includes('civil') || lowerTitle.includes('مدني')) return 'civil';
    if (lowerTitle.includes('biomedical') || lowerTitle.includes('حيوي')) return 'biomedical';
    
    return 'general';
  }
  
  /**
   * Detect seniority level based on title and experience
   */
  private static detectSeniorityLevel(title: string, experience?: string): string {
    const lowerTitle = title.toLowerCase();
    
    if (lowerTitle.includes('senior') || lowerTitle.includes('كبير')) return 'senior';
    if (lowerTitle.includes('lead') || lowerTitle.includes('قائد')) return 'lead';
    if (lowerTitle.includes('principal') || lowerTitle.includes('رئيسي')) return 'principal';
    if (lowerTitle.includes('junior') || lowerTitle.includes('مبتدئ')) return 'junior';
    
    // Check experience requirements
    if (experience) {
      const expNum = parseInt(experience);
      if (expNum >= 8) return 'senior';
      if (expNum >= 5) return 'mid';
      if (expNum >= 2) return 'junior';
    }
    
    return 'mid';
  }
  
  /**
   * Generate a unique slug from text
   */
  private static generateSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim()
      .substring(0, 50); // Limit length
  }
  
  /**
   * Generate a unique identifier to ensure domain uniqueness
   * Creates a short, readable identifier from job title
   */
  private static generateUniqueIdentifier(title: string, jobId: string): string {
    const words = title.toLowerCase().split(' ').filter(word => word.length > 2);
    const shortWords = words.slice(0, 3).map(word => word.substring(0, 4));
    const identifier = shortWords.join('-');
    
    // Add first 4 characters of job ID to ensure uniqueness
    const uniqueSuffix = jobId.substring(0, 4);
    
    return `${identifier}-${uniqueSuffix}`;
  }
  
  /**
   * Get all possible domain variations for a job
   */
  static getAllDomainVariations(config: JobURLConfig): {
    subdomain: string;
    urlPath: string;
    customDomain: string;
    professionalDomain: string;
    locationDomain: string;
    categoryDomain: string;
    seniorityDomain: string;
  } {
    return {
      subdomain: this.generateSubdomain(config.jobId, config.title),
      urlPath: this.generateURLPath(config.jobId, config.title),
      customDomain: this.generateCustomDomain(config.jobId, config.title),
      professionalDomain: this.generateProfessionalDomain(config.jobId, config.title, config.company),
      locationDomain: this.generateLocationDomain(config.jobId, config.title, config.location),
      categoryDomain: this.generateCategoryDomain(config.jobId, config.title),
      seniorityDomain: this.generateSeniorityDomain(config.jobId, config.title),
    };
  }
  
  /**
   * Validate if a domain is available (placeholder for actual validation)
   */
  static isDomainAvailable(domain: string): boolean {
    // This would typically check against a domain registrar API
    // For now, return true as placeholder
    return true;
  }
  
  /**
   * Generate a QR code URL for a job
   */
  static generateQRCodeURL(jobId: string, title: string): string {
    const url = this.generateURLPath(jobId, title);
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
  }
}
