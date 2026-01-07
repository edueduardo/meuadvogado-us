// lib/verification/bar-verification.ts
// Sistema de Verificação de Licença de Advogados - BAR USA

/*
 * IMPORTANTE - REGRAS DE VERIFICAÇÃO:
 * 
 * ✅ OBRIGATÓRIO: Licença BAR dos Estados Unidos
 *    - Advogado DEVE ter Bar Number válido de pelo menos um estado americano
 *    - Verificamos: Full Attorney, Foreign Legal Consultant, Authorized House Counsel
 *    - Esta é a ÚNICA licença que validamos oficialmente
 * 
 * ℹ️ OPCIONAL: OAB Brasil e outras licenças internacionais
 *    - Advogado PODE informar OAB ou licenças de outros países
 *    - NÃO validamos estas licenças - são apenas informativas
 *    - Responsabilidade total do advogado pela veracidade
 *    - Exibimos como "Também licenciado em: Brasil (OAB)"
 */

// Estados americanos e seus Bar Associations
export const US_STATE_BARS: Record<string, {
  name: string;
  fullName: string;
  barUrl: string;
  lookupUrl?: string;
}> = {
  AL: { name: 'Alabama', fullName: 'Alabama State Bar', barUrl: 'https://www.alabar.org' },
  AK: { name: 'Alaska', fullName: 'Alaska Bar Association', barUrl: 'https://alaskabar.org' },
  AZ: { name: 'Arizona', fullName: 'State Bar of Arizona', barUrl: 'https://www.azbar.org' },
  AR: { name: 'Arkansas', fullName: 'Arkansas Bar Association', barUrl: 'https://www.arkbar.com' },
  CA: { name: 'California', fullName: 'State Bar of California', barUrl: 'https://www.calbar.ca.gov', lookupUrl: 'https://apps.calbar.ca.gov/attorney/LicenseeSearch/QuickSearch' },
  CO: { name: 'Colorado', fullName: 'Colorado Bar Association', barUrl: 'https://www.cobar.org' },
  CT: { name: 'Connecticut', fullName: 'Connecticut Bar Association', barUrl: 'https://www.ctbar.org' },
  DE: { name: 'Delaware', fullName: 'Delaware State Bar Association', barUrl: 'https://www.dsba.org' },
  FL: { name: 'Florida', fullName: 'The Florida Bar', barUrl: 'https://www.floridabar.org', lookupUrl: 'https://www.floridabar.org/directories/find-mbr/' },
  GA: { name: 'Georgia', fullName: 'State Bar of Georgia', barUrl: 'https://www.gabar.org' },
  HI: { name: 'Hawaii', fullName: 'Hawaii State Bar Association', barUrl: 'https://hsba.org' },
  ID: { name: 'Idaho', fullName: 'Idaho State Bar', barUrl: 'https://isb.idaho.gov' },
  IL: { name: 'Illinois', fullName: 'Illinois State Bar Association', barUrl: 'https://www.isba.org' },
  IN: { name: 'Indiana', fullName: 'Indiana State Bar Association', barUrl: 'https://www.inbar.org' },
  IA: { name: 'Iowa', fullName: 'Iowa State Bar Association', barUrl: 'https://www.iowabar.org' },
  KS: { name: 'Kansas', fullName: 'Kansas Bar Association', barUrl: 'https://www.ksbar.org' },
  KY: { name: 'Kentucky', fullName: 'Kentucky Bar Association', barUrl: 'https://www.kybar.org' },
  LA: { name: 'Louisiana', fullName: 'Louisiana State Bar Association', barUrl: 'https://www.lsba.org' },
  ME: { name: 'Maine', fullName: 'Maine State Bar Association', barUrl: 'https://www.mainebar.org' },
  MD: { name: 'Maryland', fullName: 'Maryland State Bar Association', barUrl: 'https://www.msba.org' },
  MA: { name: 'Massachusetts', fullName: 'Massachusetts Bar Association', barUrl: 'https://www.massbar.org', lookupUrl: 'https://www.massbbo.org/bbolookup.php' },
  MI: { name: 'Michigan', fullName: 'State Bar of Michigan', barUrl: 'https://www.michbar.org' },
  MN: { name: 'Minnesota', fullName: 'Minnesota State Bar Association', barUrl: 'https://www.mnbar.org' },
  MS: { name: 'Mississippi', fullName: 'The Mississippi Bar', barUrl: 'https://www.msbar.org' },
  MO: { name: 'Missouri', fullName: 'The Missouri Bar', barUrl: 'https://www.mobar.org' },
  MT: { name: 'Montana', fullName: 'State Bar of Montana', barUrl: 'https://www.montanabar.org' },
  NE: { name: 'Nebraska', fullName: 'Nebraska State Bar Association', barUrl: 'https://www.nebar.com' },
  NV: { name: 'Nevada', fullName: 'State Bar of Nevada', barUrl: 'https://www.nvbar.org' },
  NH: { name: 'New Hampshire', fullName: 'New Hampshire Bar Association', barUrl: 'https://www.nhbar.org' },
  NJ: { name: 'New Jersey', fullName: 'New Jersey State Bar Association', barUrl: 'https://www.njsba.com', lookupUrl: 'https://portal.njcourts.gov/webe6/ACDS' },
  NM: { name: 'New Mexico', fullName: 'State Bar of New Mexico', barUrl: 'https://www.sbnm.org' },
  NY: { name: 'New York', fullName: 'New York State Bar Association', barUrl: 'https://www.nysba.org', lookupUrl: 'https://iapps.courts.state.ny.us/attorney/AttorneySearch' },
  NC: { name: 'North Carolina', fullName: 'North Carolina State Bar', barUrl: 'https://www.ncbar.gov' },
  ND: { name: 'North Dakota', fullName: 'State Bar Association of North Dakota', barUrl: 'https://www.sband.org' },
  OH: { name: 'Ohio', fullName: 'Ohio State Bar Association', barUrl: 'https://www.ohiobar.org' },
  OK: { name: 'Oklahoma', fullName: 'Oklahoma Bar Association', barUrl: 'https://www.okbar.org' },
  OR: { name: 'Oregon', fullName: 'Oregon State Bar', barUrl: 'https://www.osbar.org' },
  PA: { name: 'Pennsylvania', fullName: 'Pennsylvania Bar Association', barUrl: 'https://www.pabar.org' },
  RI: { name: 'Rhode Island', fullName: 'Rhode Island Bar Association', barUrl: 'https://www.ribar.com' },
  SC: { name: 'South Carolina', fullName: 'South Carolina Bar', barUrl: 'https://www.scbar.org' },
  SD: { name: 'South Dakota', fullName: 'State Bar of South Dakota', barUrl: 'https://www.sdbar.org' },
  TN: { name: 'Tennessee', fullName: 'Tennessee Bar Association', barUrl: 'https://www.tba.org' },
  TX: { name: 'Texas', fullName: 'State Bar of Texas', barUrl: 'https://www.texasbar.com', lookupUrl: 'https://www.texasbar.com/AM/Template.cfm?Section=Find_A_Lawyer' },
  UT: { name: 'Utah', fullName: 'Utah State Bar', barUrl: 'https://www.utahbar.org' },
  VT: { name: 'Vermont', fullName: 'Vermont Bar Association', barUrl: 'https://www.vtbar.org' },
  VA: { name: 'Virginia', fullName: 'Virginia State Bar', barUrl: 'https://www.vsb.org' },
  WA: { name: 'Washington', fullName: 'Washington State Bar Association', barUrl: 'https://www.wsba.org', lookupUrl: 'https://www.mywsba.org/PersonifyEbusiness/LegalDirectory.aspx' },
  WV: { name: 'West Virginia', fullName: 'West Virginia State Bar', barUrl: 'https://www.wvbar.org' },
  WI: { name: 'Wisconsin', fullName: 'State Bar of Wisconsin', barUrl: 'https://www.wisbar.org' },
  WY: { name: 'Wyoming', fullName: 'Wyoming State Bar', barUrl: 'https://www.wyomingbar.org' },
  DC: { name: 'District of Columbia', fullName: 'D.C. Bar', barUrl: 'https://www.dcbar.org', lookupUrl: 'https://www.dcbar.org/membership/find-a-member' },
};

// Tipos de licença nos EUA
export enum USLicenseType {
  FULL_ATTORNEY = 'FULL_ATTORNEY',           // Advogado Pleno - pode praticar completamente
  FOREIGN_LEGAL_CONSULTANT = 'FLC',          // Consultor Jurídico Estrangeiro
  AUTHORIZED_HOUSE_COUNSEL = 'AHC',          // Advogado interno de empresa
  LIMITED_LICENSE = 'LIMITED',               // Licença limitada
}

// Status de verificação
export enum VerificationStatus {
  PENDING = 'PENDING',         // Aguardando verificação
  IN_REVIEW = 'IN_REVIEW',     // Em análise
  VERIFIED = 'VERIFIED',       // Verificado ✓
  REJECTED = 'REJECTED',       // Rejeitado
  EXPIRED = 'EXPIRED',         // Licença expirada
}

// Interface de licença americana
export interface USBarLicense {
  state: string;                    // Estado (ex: FL, NY, CA)
  barNumber: string;                // Número do Bar
  licenseType: USLicenseType;       // Tipo de licença
  status: VerificationStatus;       // Status da verificação
  admissionDate?: string;           // Data de admissão
  expirationDate?: string;          // Data de expiração (se aplicável)
  verifiedAt?: Date;                // Data da verificação
  verifiedBy?: string;              // Quem verificou (admin ou sistema)
  lookupUrl?: string;               // URL para verificar publicamente
}

// Interface de licença internacional (apenas informativa)
export interface InternationalLicense {
  country: string;                  // País (ex: Brazil, Portugal)
  organization: string;             // Organização (ex: OAB, Ordem dos Advogados)
  registrationNumber?: string;      // Número de registro
  state?: string;                   // Estado/região (ex: SP, RJ para OAB)
  // AVISO: Esta informação NÃO É VERIFICADA pelo Meu Advogado
  disclaimer: string;
}

// Interface completa de verificação do advogado
export interface LawyerVerification {
  // OBRIGATÓRIO: Pelo menos uma licença americana
  usLicenses: USBarLicense[];
  
  // OPCIONAL: Licenças internacionais (apenas informativo)
  internationalLicenses?: InternationalLicense[];
  
  // Status geral
  isVerified: boolean;              // true se pelo menos 1 licença US verificada
  primaryState: string;             // Estado principal de atuação
  verificationDate?: Date;
}

// Serviço de verificação
export const barVerificationService = {
  // Validar formato do Bar Number por estado
  validateBarNumberFormat(state: string, barNumber: string): boolean {
    // Formatos variam por estado - validação básica
    const cleaned = barNumber.replace(/\D/g, '');
    
    // Maioria dos estados usa 5-8 dígitos
    if (cleaned.length < 4 || cleaned.length > 10) {
      return false;
    }
    
    return true;
  },

  // Criar nova solicitação de verificação
  createVerificationRequest(
    lawyerId: string,
    license: Omit<USBarLicense, 'status' | 'verifiedAt' | 'verifiedBy'>
  ): USBarLicense {
    const stateBar = US_STATE_BARS[license.state];
    
    return {
      ...license,
      status: VerificationStatus.PENDING,
      lookupUrl: stateBar?.lookupUrl || stateBar?.barUrl,
    };
  },

  // Adicionar licença internacional (apenas informativo)
  createInternationalLicense(
    country: string,
    organization: string,
    registrationNumber?: string,
    state?: string
  ): InternationalLicense {
    return {
      country,
      organization,
      registrationNumber,
      state,
      disclaimer: `Esta licença é apenas informativa e NÃO foi verificada pelo Meu Advogado. 
A responsabilidade pela veracidade desta informação é inteiramente do advogado. 
O Meu Advogado verifica APENAS licenças dos Estados Unidos (Bar).`,
    };
  },

  // Verificar se advogado pode atuar (tem pelo menos 1 licença US verificada)
  canPractice(verification: LawyerVerification): boolean {
    return verification.usLicenses.some(
      license => license.status === VerificationStatus.VERIFIED
    );
  },

  // Obter estados onde advogado pode atuar
  getLicensedStates(verification: LawyerVerification): string[] {
    return verification.usLicenses
      .filter(license => license.status === VerificationStatus.VERIFIED)
      .map(license => license.state);
  },

  // Formatar exibição de licenças internacionais
  formatInternationalLicenses(licenses: InternationalLicense[]): string {
    if (!licenses || licenses.length === 0) return '';
    
    return licenses
      .map(lic => {
        const location = lic.state ? `${lic.organization} ${lic.state}` : lic.organization;
        return `${lic.country} (${location})`;
      })
      .join(', ');
  },

  // Obter URL de verificação pública
  getPublicVerificationUrl(state: string, barNumber: string): string | null {
    const stateBar = US_STATE_BARS[state];
    return stateBar?.lookupUrl || null;
  },

  // Verificação manual por admin
  async verifyLicense(
    license: USBarLicense,
    adminId: string,
    approved: boolean,
    notes?: string
  ): Promise<USBarLicense> {
    return {
      ...license,
      status: approved ? VerificationStatus.VERIFIED : VerificationStatus.REJECTED,
      verifiedAt: new Date(),
      verifiedBy: adminId,
    };
  },
};

// Mensagens de aviso para o frontend
export const VERIFICATION_DISCLAIMERS = {
  US_LICENSE: `Verificamos a licença do advogado junto ao Bar Association do estado indicado. 
Advogados verificados passaram por conferência de credenciais.`,
  
  INTERNATIONAL_LICENSE: `⚠️ AVISO IMPORTANTE: Licenças internacionais (OAB Brasil, etc.) são apenas INFORMATIVAS.
O Meu Advogado NÃO verifica licenças de outros países.
A responsabilidade pela veracidade é inteiramente do advogado.
Para atendimento jurídico nos Estados Unidos, apenas a licença americana (Bar) é válida.`,
  
  FOREIGN_LEGAL_CONSULTANT: `Este advogado possui licença de Consultor Jurídico Estrangeiro (Foreign Legal Consultant).
Esta licença permite prestar consultoria sobre as leis do país de origem (ex: leis brasileiras),
mas NÃO permite representação em tribunais americanos.`,
};
