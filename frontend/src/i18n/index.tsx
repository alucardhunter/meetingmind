'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { enUS } from './en-US';

type TranslationDict = typeof enUS;

export const translations: Record<string, TranslationDict> = {
  'en-US': enUS,
  'pt-BR': {
    ...enUS,
    common: {
      ...enUS.common,
      appName: 'MeetingMind',
      loading: 'Carregando...',
      save: 'Salvar',
      cancel: 'Cancelar',
      delete: 'Excluir',
      edit: 'Editar',
      copy: 'Copiar',
      copied: 'Copiado!',
      error: 'Ocorreu um erro',
      retry: 'Tentar novamente',
      back: 'Voltar',
      next: 'Próximo',
      submit: 'Enviar',
      filter: 'Filtrar',
      clear: 'Limpar',
      all: 'Todos',
    },
    nav: {
      dashboard: 'Painel',
      commitments: 'Compromissos',
      meetings: 'Reuniões',
      settings: 'Configurações',
      logout: 'Sair',
      login: 'Entrar',
      signup: 'Cadastrar',
    },
    landing: {
      hero: {
        headline: 'Nunca Mais Perca uma Ação',
        subheadline:
          'Envie suas gravações de reuniões e deixe a IA extrair ações, datas e decisões importantes instantaneamente.',
        cta: 'Começar Teste Grátis',
        secondaryCta: 'Ver Demonstração',
      },
      features: {
        title: 'Tudo que você precisa para capturar insights de reuniões',
        transcription: {
          title: 'Transcrição Precisa',
          description:
            'Transcrição com IA Whisper de última geração com timestamps e detecção de falantes.',
        },
        extraction: {
          title: 'Extração Inteligente',
          description: 'Identifique automaticamente ações, prazos e valores financeiros mencionados.',
        },
        tracking: {
          title: 'Rastreamento de Compromissos',
          description: 'Acompanhe cada promessa. Veja o que está aberto, cumprido ou atrasado.',
        },
        export: {
          title: 'Exportação em Um Clique',
          description: 'Envie resumos diretamente para Notion, Linear ou Slack em segundos.',
        },
      },
      pricing: {
        title: 'Preços simples e transparentes',
        subtitle: 'Comece grátis, faça upgrade quando precisar.',
        free: {
          name: 'Grátis',
          price: 'R$0',
          period: 'para sempre',
          description: 'Perfeito para testar o MeetingMind',
          features: [
            '3 reuniões por mês',
            '30 minutos por reunião',
            'Transcrição básica',
            'Suporte por email',
          ],
        },
        pro: {
          name: 'Pro',
          price: 'R$49',
          period: 'por mês',
          description: 'Para profissionais que precisam de mais',
          features: [
            'Reuniões ilimitadas',
            '4 horas por reunião',
            'Transcrição prioritária',
            'Todas as exportações',
            'Acesso à API',
          ],
        },
        team: {
          name: 'Equipe',
          price: 'R$129',
          period: 'por mês',
          description: 'Para equipes com muitas reuniões',
          features: [
            'Tudo do Pro',
            '5 membros da equipe',
            'Workspace compartilhado',
            'Painel administrativo',
            'SSO',
          ],
        },
        cta: 'Começar',
      },
      footer: {
        tagline: 'Inteligência de reuniões com IA.',
        product: 'Produto',
        company: 'Empresa',
        legal: 'Legal',
        links: {
          features: 'Funcionalidades',
          pricing: 'Preços',
          about: 'Sobre',
          blog: 'Blog',
          careers: 'Carreiras',
          privacy: 'Política de Privacidade',
          terms: 'Termos de Serviço',
        },
      },
    },
    auth: {
      login: {
        title: 'Bem-vindo de volta',
        subtitle: 'Não tem uma conta?',
        signupLink: 'Cadastre-se',
        email: 'Endereço de email',
        password: 'Senha',
        submit: 'Entrar',
        forgotPassword: 'Esqueceu a senha?',
      },
      signup: {
        title: 'Crie sua conta',
        subtitle: 'Já tem uma conta?',
        loginLink: 'Entrar',
        name: 'Nome completo',
        email: 'Endereço de email',
        password: 'Senha',
        confirmPassword: 'Confirmar senha',
        submit: 'Criar Conta',
        terms: 'Ao se cadastrar, você concorda com nossos Termos de Serviço e Política de Privacidade.',
      },
      validation: {
        emailRequired: 'Email é obrigatório',
        emailInvalid: 'Por favor, insira um email válido',
        passwordRequired: 'Senha é obrigatória',
        passwordMin: 'A senha deve ter pelo menos 8 caracteres',
        nameRequired: 'Nome é obrigatório',
        passwordMismatch: 'As senhas não coincidem',
      },
    },
    dashboard: {
      title: 'Painel',
      welcome: 'Bem-vindo, {{name}}',
      stats: {
        totalCommitments: 'Total de Compromissos',
        open: 'Abertos',
        fulfilled: 'Cumpridos',
        overdue: 'Atrasados',
      },
      alerts: {
        overdueTitle: 'Compromissos Atrasados',
        overdueDescription: 'Você tem {{count}} compromisso(s) atrasado(s). Tome providências.',
        viewAll: 'Ver Todos',
      },
      quickUpload: 'Nova Reunião',
      recentCommitments: 'Compromissos Recentes',
      viewAllCommitments: 'Ver Todos Compromissos',
      commitments: {
        empty: {
          title: 'Nenhum compromisso ainda',
          description: 'Envie uma reunião e extrairemos todos os compromissos automaticamente.',
          cta: 'Enviar Reunião',
        },
        status: {
          open: 'Abertos',
          fulfilled: 'Cumpridos',
          overdue: 'Atrasados',
        },
        deadline: 'Vence {{date}}',
        fromMeeting: 'De "{{meeting}}"',
      },
      meetings: {
        title: 'Reuniões Recentes',
        viewAll: 'Ver Todas',
        empty: {
          title: 'Nenhuma reunião ainda',
          description: 'Envie sua primeira gravação de reunião para começar.',
          cta: 'Enviar Reunião',
        },
      },
    },
    commitments: {
      title: 'Todos os Compromissos',
      subtitle: 'Cada promessa, prazo e valor — em todas as suas reuniões.',
      filters: {
        status: 'Status',
        client: 'Cliente / Contato',
        dateRange: 'Período',
        from: 'De',
        to: 'Até',
        sortBy: 'Ordenar Por',
        sort: {
          deadline: 'Prazo',
          created: 'Data de Criação',
          amount: 'Valor',
        },
      },
      status: {
        open: 'Aberto',
        fulfilled: 'Cumprido',
        overdue: 'Atrasado',
        all: 'Todos',
      },
      empty: {
        title: 'Nenhum compromisso encontrado',
        description: 'Tente ajustar os filtros ou envie uma reunião.',
      },
      actions: {
        viewMeeting: 'Ver Reunião',
        markFulfilled: 'Marcar Cumprido',
        markOpen: 'Reabrir',
      },
      goToMeeting: 'Ir para reunião',
    },
    meetings: {
      new: {
        title: 'Enviar Reunião',
        subtitle: 'Grave ou envie um arquivo de áudio',
        titleLabel: 'Título da Reunião',
        titlePlaceholder: 'ex: Sessão de Planejamento Q4',
        contactLabel: 'Cliente / Contato',
        contactPlaceholder: 'ex: Acme Corp ou João Silva',
        dateLabel: 'Data da Reunião',
        dropzone: {
          title: 'Arraste seu arquivo de áudio aqui',
          subtitle: 'ou clique para procurar',
          formats: 'Suporta MP3, WAV, M4A, OGG (máx 500MB)',
        },
        record: {
          title: 'Ou grave ao vivo',
          start: 'Iniciar Gravação',
          stop: 'Parar Gravação',
          recording: 'Gravando...',
        },
        upload: 'Enviar & Extrair',
        uploading: 'Enviando...',
        processing: 'Extraindo compromissos...',
      },
      detail: {
        title: 'Detalhes da Reunião',
        commitments: 'Compromissos',
        transcript: 'Transcrição',
        summary: 'Resumo',
        actionItems: 'Ações',
        dates: 'Datas Importantes',
        amounts: 'Valores Mencionados',
        deliverables: 'Entregas',
        noCommitments: 'Nenhum compromisso extraído ainda',
        noActionItems: 'Nenhuma ação detectada',
        noDates: 'Nenhuma data encontrada',
        noAmounts: 'Nenhum valor encontrado',
        noDeliverables: 'Nenhuma entrega encontrada',
        noTranscript: 'Transcrição ainda não disponível',
        export: {
          title: 'Exportar',
          copy: 'Copiar para Área de Transferência',
          notion: 'Enviar para Notion',
          slack: 'Enviar para Slack',
          copied: 'Copiado!',
        },
        status: {
          pending: 'Processando',
          transcribed: 'Transcrito',
          summarized: 'Resumido',
        },
        commitmentCard: {
          deadline: 'Prazo',
          amount: 'Valor',
          owner: 'Responsável',
          noDeadline: 'Sem prazo',
          noAmount: 'Sem valor',
          noOwner: 'Não atribuído',
          markFulfilled: 'Marcar Cumprido',
          markOpen: 'Reabrir',
        },
      },
    },
    settings: {
      title: 'Configurações',
      profile: {
        title: 'Perfil',
        name: 'Nome',
        email: 'Email',
      },
      integrations: {
        title: 'Integrações',
        openai: {
          title: 'Chave da API OpenAI',
          description: 'Usada para transcrição e extração de compromissos',
          placeholder: 'sk-...',
        },
        notion: {
          title: 'Integração Notion',
          apiKey: 'Chave da API Notion',
          pageId: 'ID da Página Notion',
          apiKeyPlaceholder: 'secret_...',
          pageIdPlaceholder: 'ID da página na URL do Notion',
        },
        slack: {
          title: 'Webhook do Slack',
          description: 'Envie resumos de reuniões para canais do Slack',
          placeholder: 'https://hooks.slack.com/services/...',
        },
      },
      notifications: {
        title: 'Notificações',
        reminderEnabled: 'Lembretes de Prazo',
        reminderDescription: 'Receba um email quando um prazo passar',
        reminderEmail: 'Email para Lembretes',
        reminderEmailPlaceholder: 'Email para receber lembretes',
      },
      danger: {
        title: 'Zona de Perigo',
        description: 'Exclua permanentemente sua conta e todos os dados.',
        button: 'Excluir Conta',
        confirm: 'Tem certeza? Esta ação não pode ser desfeita.',
      },
    },
  },
  'pt-PT': {
    ...enUS,
    common: {
      ...enUS.common,
      appName: 'MeetingMind',
      loading: 'A carregar...',
      save: 'Guardar',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      edit: 'Editar',
      copy: 'Copiar',
      copied: 'Copiado!',
      error: 'Ocorreu um erro',
      retry: 'Tentar novamente',
      back: 'Voltar',
      next: 'Próximo',
      submit: 'Submeter',
      filter: 'Filtrar',
      clear: 'Limpar',
      all: 'Todos',
    },
    nav: {
      dashboard: 'Painel',
      commitments: 'Compromissos',
      meetings: 'Reuniões',
      settings: 'Definições',
      logout: 'Terminar Sessão',
      login: 'Iniciar Sessão',
      signup: 'Registar',
    },
    landing: {
      hero: {
        headline: 'Nunca Mais Perca uma Ação',
        subheadline:
          'Carregue as suas gravações de reuniões e deixe a IA extrair ações, datas e decisões importantes instantaneamente.',
        cta: 'Começar Teste Grátis',
        secondaryCta: 'Ver Demonstração',
      },
      features: {
        title: 'Tudo o que precisa para capturar insights de reuniões',
        transcription: {
          title: 'Transcrição Precisa',
          description:
            'Transcrição com IA Whisper de última geração com timestamps e deteção de falantes.',
        },
        extraction: {
          title: 'Extração Inteligente',
          description: 'Identifique automaticamente ações, prazos e valores financeiros mencionados.',
        },
        tracking: {
          title: 'Rastreamento de Compromissos',
          description: 'Acompanhe cada promessa. Veja o que está aberto, cumprido ou atrasado.',
        },
        export: {
          title: 'Exportação num Clique',
          description: 'Envie resumos diretamente para Notion, Linear ou Slack em segundos.',
        },
      },
      pricing: {
        title: 'Preços simples e transparentes',
        subtitle: 'Comece grátis, faça upgrade quando precisar.',
        free: {
          name: 'Grátis',
          price: '€0',
          period: 'para sempre',
          description: 'Perfeito para experimentar o MeetingMind',
          features: [
            '3 reuniões por mês',
            '30 minutos por reunião',
            'Transcrição básica',
            'Suporte por email',
          ],
        },
        pro: {
          name: 'Pro',
          price: '€19',
          period: 'por mês',
          description: 'Para profissionais que precisam de mais',
          features: [
            'Reuniões ilimitadas',
            '4 horas por reunião',
            'Transcrição prioritária',
            'Todas as exportações',
            'Acesso à API',
          ],
        },
        team: {
          name: 'Equipa',
          price: '€49',
          period: 'por mês',
          description: 'Para equipas com muitas reuniões',
          features: [
            'Tudo do Pro',
            '5 membros da equipa',
            'Workspace partilhado',
            'Painel administrativo',
            'SSO',
          ],
        },
        cta: 'Começar',
      },
      footer: {
        tagline: 'Inteligência de reuniões com IA.',
        product: 'Produto',
        company: 'Empresa',
        legal: 'Legal',
        links: {
          features: 'Funcionalidades',
          pricing: 'Preços',
          about: 'Sobre',
          blog: 'Blog',
          careers: 'Carreiras',
          privacy: 'Política de Privacidade',
          terms: 'Termos de Serviço',
        },
      },
    },
    auth: {
      login: {
        title: 'Bem-vindo de volta',
        subtitle: 'Não tem uma conta?',
        signupLink: 'Registar',
        email: 'Endereço de email',
        password: 'Palavra-passe',
        submit: 'Iniciar Sessão',
        forgotPassword: 'Esqueceu a palavra-passe?',
      },
      signup: {
        title: 'Crie a sua conta',
        subtitle: 'Já tem uma conta?',
        loginLink: 'Iniciar sessão',
        name: 'Nome completo',
        email: 'Endereço de email',
        password: 'Palavra-passe',
        confirmPassword: 'Confirmar palavra-passe',
        submit: 'Criar Conta',
        terms: 'Ao registar-se, concorda com os nossos Termos de Serviço e Política de Privacidade.',
      },
      validation: {
        emailRequired: 'Email é obrigatório',
        emailInvalid: 'Por favor, insira um email válido',
        passwordRequired: 'Palavra-passe é obrigatória',
        passwordMin: 'A palavra-passe deve ter pelo menos 8 caracteres',
        nameRequired: 'Nome é obrigatório',
        passwordMismatch: 'As palavras-passe não coincidem',
      },
    },
    dashboard: {
      title: 'Painel',
      welcome: 'Bem-vindo, {{name}}',
      stats: {
        totalCommitments: 'Total de Compromissos',
        open: 'Abertos',
        fulfilled: 'Cumpridos',
        overdue: 'Atrasados',
      },
      alerts: {
        overdueTitle: 'Compromissos Atrasados',
        overdueDescription:
          'Tem {{count}} compromisso(s) atrasado(s). Tome providências.',
        viewAll: 'Ver Todos',
      },
      quickUpload: 'Nova Reunião',
      recentCommitments: 'Compromissos Recentes',
      viewAllCommitments: 'Ver Todos Compromissos',
      commitments: {
        empty: {
          title: 'Nenhum compromisso ainda',
          description: 'Carregue uma reunião e extrairemos todos os compromissos automaticamente.',
          cta: 'Carregar Reunião',
        },
        status: {
          open: 'Abertos',
          fulfilled: 'Cumpridos',
          overdue: 'Atrasados',
        },
        deadline: 'Vence {{date}}',
        fromMeeting: 'De "{{meeting}}"',
      },
      meetings: {
        title: 'Reuniões Recentes',
        viewAll: 'Ver Todas',
        empty: {
          title: 'Nenhuma reunião ainda',
          description: 'Carregue a sua primeira gravação de reunião para começar.',
          cta: 'Carregar Reunião',
        },
      },
    },
    commitments: {
      title: 'Todos os Compromissos',
      subtitle: 'Cada promessa, prazo e valor — em todas as suas reuniões.',
      filters: {
        status: 'Status',
        client: 'Cliente / Contacto',
        dateRange: 'Período',
        from: 'De',
        to: 'Até',
        sortBy: 'Ordenar Por',
        sort: {
          deadline: 'Prazo',
          created: 'Data de Criação',
          amount: 'Valor',
        },
      },
      status: {
        open: 'Aberto',
        fulfilled: 'Cumprido',
        overdue: 'Atrasado',
        all: 'Todos',
      },
      empty: {
        title: 'Nenhum compromisso encontrado',
        description: 'Tente ajustar os filtros ou carregue uma reunião.',
      },
      actions: {
        viewMeeting: 'Ver Reunião',
        markFulfilled: 'Marcar Cumprido',
        markOpen: 'Reabrir',
      },
      goToMeeting: 'Ir para reunião',
    },
    meetings: {
      new: {
        title: 'Carregar Reunião',
        subtitle: 'Grave ou carregue um ficheiro de áudio',
        titleLabel: 'Título da Reunião',
        titlePlaceholder: 'ex: Sessão de Planeamento Q4',
        contactLabel: 'Cliente / Contacto',
        contactPlaceholder: 'ex: Acme Corp ou João Silva',
        dateLabel: 'Data da Reunião',
        dropzone: {
          title: 'Arraste o seu ficheiro de áudio aqui',
          subtitle: 'ou clique para procurar',
          formats: 'Suporta MP3, WAV, M4A, OGG (máx 500MB)',
        },
        record: {
          title: 'Ou grave ao vivo',
          start: 'Iniciar Gravação',
          stop: 'Parar Gravação',
          recording: 'A gravar...',
        },
        upload: 'Carregar & Extrair',
        uploading: 'A carregar...',
        processing: 'A extrair compromissos...',
      },
      detail: {
        title: 'Detalhes da Reunião',
        commitments: 'Compromissos',
        transcript: 'Transcrição',
        summary: 'Resumo',
        actionItems: 'Ações',
        dates: 'Datas Importantes',
        amounts: 'Valores Mencionados',
        deliverables: 'Entregas',
        noCommitments: 'Nenhum compromisso extraído ainda',
        noActionItems: 'Nenhuma ação detetada',
        noDates: 'Nenhuma data encontrada',
        noAmounts: 'Nenhum valor encontrado',
        noDeliverables: 'Nenhuma entrega encontrada',
        noTranscript: 'Transcrição ainda não disponível',
        export: {
          title: 'Exportar',
          copy: 'Copiar para Área de Transferência',
          notion: 'Enviar para Notion',
          slack: 'Enviar para Slack',
          copied: 'Copiado!',
        },
        status: {
          pending: 'A processar',
          transcribed: 'Transcrito',
          summarized: 'Resumido',
        },
        commitmentCard: {
          deadline: 'Prazo',
          amount: 'Valor',
          owner: 'Responsável',
          noDeadline: 'Sem prazo',
          noAmount: 'Sem valor',
          noOwner: 'Não atribuído',
          markFulfilled: 'Marcar Cumprido',
          markOpen: 'Reabrir',
        },
      },
    },
    settings: {
      title: 'Definições',
      profile: {
        title: 'Perfil',
        name: 'Nome',
        email: 'Email',
      },
      integrations: {
        title: 'Integrações',
        openai: {
          title: 'Chave da API OpenAI',
          description: 'Usada para transcrição e extração de compromissos',
          placeholder: 'sk-...',
        },
        notion: {
          title: 'Integração Notion',
          apiKey: 'Chave da API Notion',
          pageId: 'ID da Página Notion',
          apiKeyPlaceholder: 'secret_...',
          pageIdPlaceholder: 'ID da página no URL do Notion',
        },
        slack: {
          title: 'Webhook do Slack',
          description: 'Envie resumos de reuniões para canais do Slack',
          placeholder: 'https://hooks.slack.com/services/...',
        },
      },
      notifications: {
        title: 'Notificações',
        reminderEnabled: 'Lembretes de Prazo',
        reminderDescription: 'Receba um email quando um prazo passar',
        reminderEmail: 'Email para Lembretes',
        reminderEmailPlaceholder: 'Email para receber lembretes',
      },
      danger: {
        title: 'Zona de Perigo',
        description: 'Elimine permanentemente a sua conta e todos os dados.',
        button: 'Eliminar Conta',
        confirm: 'Tem a certeza? Esta ação não pode ser desfeita.',
      },
    },
  },
  'es-ES': {
    ...enUS,
    common: {
      ...enUS.common,
      appName: 'MeetingMind',
      loading: 'Cargando...',
      save: 'Guardar',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      edit: 'Editar',
      copy: 'Copiar',
      copied: '¡Copiado!',
      error: 'Ha ocurrido un error',
      retry: 'Reintentar',
      back: 'Volver',
      next: 'Siguiente',
      submit: 'Enviar',
      filter: 'Filtrar',
      clear: 'Limpiar',
      all: 'Todos',
    },
    nav: {
      dashboard: 'Panel',
      commitments: 'Compromisos',
      meetings: 'Reuniones',
      settings: 'Configuración',
      logout: 'Cerrar Sesión',
      login: 'Iniciar Sesión',
      signup: 'Registrarse',
    },
    landing: {
      hero: {
        headline: 'Nunca Más Pierdas una Acción',
        subheadline:
          'Sube tus grabaciones de reuniones y deja que la IA extraiga acciones, fechas y decisiones clave al instante.',
        cta: 'Comenzar Prueba Gratis',
        secondaryCta: 'Ver Demo',
      },
      features: {
        title: 'Todo lo que necesitas para capturar insights de reuniones',
        transcription: {
          title: 'Transcripción Precisa',
          description:
            'Transcripción con IA Whisper de última generación con timestamps y detección de hablantes.',
        },
        extraction: {
          title: 'Extracción Inteligente',
          description: 'Identifica automáticamente acciones, plazos y valores financieros mencionados.',
        },
        tracking: {
          title: 'Seguimiento de Compromisos',
          description: 'Haz seguimiento de cada promesa. Mira qué está abierto, cumplido o atrasado.',
        },
        export: {
          title: 'Exportación en Un Clic',
          description: 'Envía resúmenes directamente a Notion, Linear o Slack en segundos.',
        },
      },
      pricing: {
        title: 'Precios simples y transparentes',
        subtitle: 'Empieza gratis, haz upgrade cuando necesites.',
        free: {
          name: 'Gratis',
          price: '€0',
          period: 'para siempre',
          description: 'Perfecto para probar MeetingMind',
          features: [
            '3 reuniones al mes',
            '30 minutos por reunión',
            'Transcripción básica',
            'Soporte por email',
          ],
        },
        pro: {
          name: 'Pro',
          price: '€19',
          period: 'por mes',
          description: 'Para profesionales que necesitan más',
          features: [
            'Reuniones ilimitadas',
            '4 horas por reunión',
            'Transcripción prioritaria',
            'Todas las exportaciones',
            'Acceso a API',
          ],
        },
        team: {
          name: 'Equipo',
          price: '€49',
          period: 'por mes',
          description: 'Para equipos con muchas reuniones',
          features: [
            'Todo lo de Pro',
            '5 miembros del equipo',
            'Workspace compartido',
            'Panel de administración',
            'SSO',
          ],
        },
        cta: 'Comenzar',
      },
      footer: {
        tagline: 'Inteligencia de reuniones con IA.',
        product: 'Producto',
        company: 'Empresa',
        legal: 'Legal',
        links: {
          features: 'Funcionalidades',
          pricing: 'Precios',
          about: 'Acerca de',
          blog: 'Blog',
          careers: 'Carreras',
          privacy: 'Política de Privacidad',
          terms: 'Términos de Servicio',
        },
      },
    },
    auth: {
      login: {
        title: 'Bienvenido de nuevo',
        subtitle: '¿No tienes cuenta?',
        signupLink: 'Regístrate',
        email: 'Correo electrónico',
        password: 'Contraseña',
        submit: 'Iniciar Sesión',
        forgotPassword: '¿Olvidaste tu contraseña?',
      },
      signup: {
        title: 'Crea tu cuenta',
        subtitle: '¿Ya tienes cuenta?',
        loginLink: 'Inicia sesión',
        name: 'Nombre completo',
        email: 'Correo electrónico',
        password: 'Contraseña',
        confirmPassword: 'Confirmar contraseña',
        submit: 'Crear Cuenta',
        terms: 'Al registrarte, aceptas nuestros Términos de Servicio y Política de Privacidad.',
      },
      validation: {
        emailRequired: 'El correo es obligatorio',
        emailInvalid: 'Por favor, introduce un correo válido',
        passwordRequired: 'La contraseña es obligatoria',
        passwordMin: 'La contraseña debe tener al menos 8 caracteres',
        nameRequired: 'El nombre es obligatorio',
        passwordMismatch: 'Las contraseñas no coinciden',
      },
    },
    dashboard: {
      title: 'Panel',
      welcome: 'Bienvenido, {{name}}',
      stats: {
        totalCommitments: 'Total de Compromisos',
        open: 'Abiertos',
        fulfilled: 'Cumplidos',
        overdue: 'Atrasados',
      },
      alerts: {
        overdueTitle: 'Compromisos Atrasados',
        overdueDescription: 'Tienes {{count}} compromiso(s) atrasado(s). Toma acción ahora.',
        viewAll: 'Ver Todos',
      },
      quickUpload: 'Nueva Reunión',
      recentCommitments: 'Compromisos Recientes',
      viewAllCommitments: 'Ver Todos Compromisos',
      commitments: {
        empty: {
          title: 'Sin compromisos aún',
          description: 'Sube una reunión y extraeremos todos los compromisos automáticamente.',
          cta: 'Subir Reunión',
        },
        status: {
          open: 'Abiertos',
          fulfilled: 'Cumplidos',
          overdue: 'Atrasados',
        },
        deadline: 'Vence {{date}}',
        fromMeeting: 'De "{{meeting}}"',
      },
      meetings: {
        title: 'Reuniones Recientes',
        viewAll: 'Ver Todas',
        empty: {
          title: 'Sin reuniones aún',
          description: 'Sube tu primera grabación de reunión para empezar.',
          cta: 'Subir Reunión',
        },
      },
    },
    commitments: {
      title: 'Todos los Compromisos',
      subtitle: 'Cada promesa, plazo y valor — en todas tus reuniones.',
      filters: {
        status: 'Estado',
        client: 'Cliente / Contacto',
        dateRange: 'Rango de Fechas',
        from: 'Desde',
        to: 'Hasta',
        sortBy: 'Ordenar Por',
        sort: {
          deadline: 'Plazo',
          created: 'Fecha de Creación',
          amount: 'Monto',
        },
      },
      status: {
        open: 'Abierto',
        fulfilled: 'Cumplido',
        overdue: 'Atrasado',
        all: 'Todos',
      },
      empty: {
        title: 'No se encontraron compromisos',
        description: 'Intenta ajustar los filtros o sube una reunión.',
      },
      actions: {
        viewMeeting: 'Ver Reunión',
        markFulfilled: 'Marcar Cumplido',
        markOpen: 'Reabrir',
      },
      goToMeeting: 'Ir a reunión',
    },
    meetings: {
      new: {
        title: 'Subir Reunión',
        subtitle: 'Graba o sube un archivo de audio',
        titleLabel: 'Título de la Reunión',
        titlePlaceholder: 'ej: Sesión de Planificación Q4',
        contactLabel: 'Cliente / Contacto',
        contactPlaceholder: 'ej: Acme Corp o Juan Pérez',
        dateLabel: 'Fecha de la Reunión',
        dropzone: {
          title: 'Arrastra tu archivo de audio aquí',
          subtitle: 'o haz clic para buscar',
          formats: 'Soporta MP3, WAV, M4A, OGG (máx 500MB)',
        },
        record: {
          title: 'O graba en vivo',
          start: 'Iniciar Grabación',
          stop: 'Detener Grabación',
          recording: 'Grabando...',
        },
        upload: 'Subir & Extraer',
        uploading: 'Subiendo...',
        processing: 'Extrayendo compromisos...',
      },
      detail: {
        title: 'Detalles de la Reunión',
        commitments: 'Compromisos',
        transcript: 'Transcripción',
        summary: 'Resumen',
        actionItems: 'Acciones',
        dates: 'Fechas Clave',
        amounts: 'Montos Mencionados',
        deliverables: 'Entregables',
        noCommitments: 'No se extrajeron compromisos aún',
        noActionItems: 'No se detectaron acciones',
        noDates: 'No se encontraron fechas',
        noAmounts: 'No se encontraron montos',
        noDeliverables: 'No se encontraron entregables',
        noTranscript: 'Transcripción aún no disponible',
        export: {
          title: 'Exportar',
          copy: 'Copiar al Portapapeles',
          notion: 'Enviar a Notion',
          slack: 'Enviar a Slack',
          copied: '¡Copiado!',
        },
        status: {
          pending: 'Procesando',
          transcribed: 'Transcrito',
          summarized: 'Resumido',
        },
        commitmentCard: {
          deadline: 'Plazo',
          amount: 'Monto',
          owner: 'Responsable',
          noDeadline: 'Sin plazo',
          noAmount: 'Sin monto',
          noOwner: 'Sin asignar',
          markFulfilled: 'Marcar Cumplido',
          markOpen: 'Reabrir',
        },
      },
    },
    settings: {
      title: 'Configuración',
      profile: {
        title: 'Perfil',
        name: 'Nombre',
        email: 'Correo',
      },
      integrations: {
        title: 'Integraciones',
        openai: {
          title: 'Clave de API de OpenAI',
          description: 'Usada para transcripción y extracción de compromisos',
          placeholder: 'sk-...',
        },
        notion: {
          title: 'Integración Notion',
          apiKey: 'Clave de API de Notion',
          pageId: 'ID de Página de Notion',
          apiKeyPlaceholder: 'secret_...',
          pageIdPlaceholder: 'ID de página en la URL de Notion',
        },
        slack: {
          title: 'Webhook de Slack',
          description: 'Envía resúmenes de reuniones a canales de Slack',
          placeholder: 'https://hooks.slack.com/services/...',
        },
      },
      notifications: {
        title: 'Notificaciones',
        reminderEnabled: 'Recordatorios de Plazo',
        reminderDescription: 'Recibe un email cuando un plazo pase',
        reminderEmail: 'Email para Recordatorios',
        reminderEmailPlaceholder: 'Email para recibir recordatorios',
      },
      danger: {
        title: 'Zona de Peligro',
        description: 'Elimina permanentemente tu cuenta y todos los datos.',
        button: 'Eliminar Cuenta',
        confirm: '¿Estás seguro? Esta acción no se puede deshacer.',
      },
    },
  },
};

interface I18nContextType {
  locale: string;
  setLocale: (locale: string) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState('en-US');

  const t = useCallback(
    (key: string, params?: Record<string, string>): string => {
      const keys = key.split('.');
      let value: unknown = translations[locale] || translations['en-US'];

      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = (value as Record<string, unknown>)[k];
        } else {
          return key;
        }
      }

      if (typeof value !== 'string') return key;

      if (params) {
        return value.replace(/\{\{(\w+)\}\}/g, (_, k) => params[k] || '');
      }

      return value;
    },
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}

export const supportedLocales = [
  { code: 'en-US', name: 'English', flag: '🇺🇸' },
  { code: 'pt-BR', name: 'Português (Brasil)', flag: '🇧🇷' },
  { code: 'pt-PT', name: 'Português (Portugal)', flag: '🇵🇹' },
  { code: 'es-ES', name: 'Español', flag: '🇪🇸' },
];
