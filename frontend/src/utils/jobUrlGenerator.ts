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
   * Format: job-{jobId}.anoudjob.com
   */
  static generateSubdomain(jobId: string): string {
    return `${this.SUBDOMAIN_PREFIX}-${jobId}.${this.BASE_DOMAIN}`;
  }
  
  /**
   * Generate a unique URL path for a job
   * Format: anoudjob.com/jobs/{jobId}/{slug}
   */
  static generateURLPath(jobId: string, title: string): string {
    const slug = this.generateSlug(title);
    return `https://${this.BASE_DOMAIN}/jobs/${jobId}/${slug}`;
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
   * Get all possible domain variations for a job
   */
  static getAllDomainVariations(config: JobURLConfig): {
    subdomain: string;
    urlPath: string;
    customDomain: string;
    professionalDomain: string;
    locationDomain: string;
  } {
    return {
      subdomain: this.generateSubdomain(config.jobId),
      urlPath: this.generateURLPath(config.jobId, config.title),
      customDomain: this.generateCustomDomain(config.jobId, config.title),
      professionalDomain: this.generateProfessionalDomain(config.jobId, config.title, config.company),
      locationDomain: this.generateLocationDomain(config.jobId, config.title, config.location),
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
