// Dummy data for recruitment system
import { 
  RecruitmentProcess, 
  Candidate, 
  Publication, 
  Recruiter,
  RecruitmentStatus,
  CandidateStatus,
  CandidateStage 
} from '../types/recruitment';

// Mock recruiters
export const mockRecruiters: Recruiter[] = [
  {
    id: 'rec-1',
    name: 'Ana García',
    email: 'ana.garcia@company.com',
    department: 'HR',
    isActive: true,
    specializations: ['Technology', 'Engineering'],
    experience: 5,
    location: 'Lima, Peru'
  },
  {
    id: 'rec-2',
    name: 'Carlos Mendoza',
    email: 'carlos.mendoza@company.com',
    department: 'HR',
    isActive: true,
    specializations: ['Design', 'Product'],
    experience: 3,
    location: 'Remote'
  },
  {
    id: 'rec-3',
    name: 'María Rodriguez',
    email: 'maria.rodriguez@company.com',
    department: 'HR',
    isActive: true,
    specializations: ['Sales', 'Marketing'],
    experience: 7,
    location: 'Arequipa, Peru'
  }
];

// Mock candidates
export const mockCandidates: Candidate[] = [
  {
    id: 'cand-1',
    personalInfo: {
      firstName: 'Juan',
      lastName: 'Pérez',
      location: {
        city: 'Lima',
        country: 'Peru'
      }
    },
    contact: {
      email: 'juan.perez@email.com',
      phone: '+51 999 888 777',
      linkedin: 'https://linkedin.com/in/juanperez'
    },
    profile: {
      summary: 'Experienced software developer with 5+ years in React and Node.js',
      skills: [
        { name: 'React', level: 'Advanced' },
        { name: 'Node.js', level: 'Advanced' },
        { name: 'TypeScript', level: 'Intermediate' }
      ],
      experience: [
        {
          company: 'Tech Solutions',
          position: 'Senior Frontend Developer',
          startDate: '2020-01-01',
          current: true,
          description: 'Lead frontend development for web applications'
        }
      ]
    },
    status: 'new',
    stage: 'applied',
    assessment: {
      matchScore: 85
    },
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'cand-2',
    personalInfo: {
      firstName: 'María',
      lastName: 'González',
      location: {
        city: 'Arequipa',
        country: 'Peru'
      }
    },
    contact: {
      email: 'maria.gonzalez@email.com',
      phone: '+51 888 777 666',
      linkedin: 'https://linkedin.com/in/mariagonzalez'
    },
    profile: {
      summary: 'UX Designer with passion for user-centered design',
      skills: [
        { name: 'Figma', level: 'Expert' },
        { name: 'Adobe XD', level: 'Advanced' },
        { name: 'Prototyping', level: 'Advanced' }
      ],
      experience: [
        {
          company: 'Design Studio',
          position: 'UX Designer',
          startDate: '2019-06-01',
          current: true,
          description: 'Design user experiences for mobile and web applications'
        }
      ]
    },
    status: 'contacted',
    stage: 'screening',
    assessment: {
      matchScore: 92
    },
    createdAt: '2024-01-10T14:30:00Z',
    updatedAt: '2024-01-16T09:15:00Z'
  },
  {
    id: 'cand-3',
    personalInfo: {
      firstName: 'Carlos',
      lastName: 'Rodriguez',
      location: {
        city: 'Cusco',
        country: 'Peru'
      }
    },
    contact: {
      email: 'carlos.rodriguez@email.com',
      phone: '+51 777 666 555',
      linkedin: 'https://linkedin.com/in/carlosrodriguez'
    },
    profile: {
      summary: 'Full-stack developer with expertise in modern web technologies',
      skills: [
        { name: 'Vue.js', level: 'Advanced' },
        { name: 'Python', level: 'Expert' },
        { name: 'Django', level: 'Advanced' }
      ],
      experience: [
        {
          company: 'Web Innovations',
          position: 'Full Stack Developer',
          startDate: '2021-03-01',
          current: true,
          description: 'Develop and maintain web applications using Vue.js and Python'
        }
      ]
    },
    status: 'interview',
    stage: 'technical',
    assessment: {
      matchScore: 78
    },
    createdAt: '2024-01-12T11:20:00Z',
    updatedAt: '2024-01-18T14:45:00Z'
  },
  {
    id: 'cand-4',
    personalInfo: {
      firstName: 'Ana',
      lastName: 'Morales',
      location: {
        city: 'Trujillo',
        country: 'Peru'
      }
    },
    contact: {
      email: 'ana.morales@email.com',
      phone: '+51 666 555 444',
      linkedin: 'https://linkedin.com/in/anamorales'
    },
    profile: {
      summary: 'Backend developer specializing in microservices and cloud architecture',
      skills: [
        { name: 'Java', level: 'Expert' },
        { name: 'Spring Boot', level: 'Advanced' },
        { name: 'AWS', level: 'Intermediate' }
      ],
      experience: [
        {
          company: 'Cloud Systems',
          position: 'Backend Developer',
          startDate: '2019-08-01',
          current: true,
          description: 'Design and implement scalable backend services'
        }
      ]
    },
    status: 'offer',
    stage: 'offer',
    assessment: {
      matchScore: 88
    },
    createdAt: '2024-01-08T09:30:00Z',
    updatedAt: '2024-01-20T16:20:00Z'
  },
  {
    id: 'cand-5',
    personalInfo: {
      firstName: 'Luis',
      lastName: 'Vargas',
      location: {
        city: 'Piura',
        country: 'Peru'
      }
    },
    contact: {
      email: 'luis.vargas@email.com',
      phone: '+51 555 444 333',
      linkedin: 'https://linkedin.com/in/luisvargas'
    },
    profile: {
      summary: 'Mobile developer with experience in React Native and Flutter',
      skills: [
        { name: 'React Native', level: 'Advanced' },
        { name: 'Flutter', level: 'Intermediate' },
        { name: 'JavaScript', level: 'Advanced' }
      ],
      experience: [
        {
          company: 'Mobile Apps Inc',
          position: 'Mobile Developer',
          startDate: '2020-05-01',
          current: true,
          description: 'Develop cross-platform mobile applications'
        }
      ]
    },
    status: 'hired',
    stage: 'hired',
    assessment: {
      matchScore: 95
    },
    createdAt: '2024-01-05T13:15:00Z',
    updatedAt: '2024-01-22T10:30:00Z'
  },
  {
    id: 'cand-6',
    personalInfo: {
      firstName: 'Sofia',
      lastName: 'Herrera',
      location: {
        city: 'Iquitos',
        country: 'Peru'
      }
    },
    contact: {
      email: 'sofia.herrera@email.com',
      phone: '+51 444 333 222',
      linkedin: 'https://linkedin.com/in/sofiaherrera'
    },
    profile: {
      summary: 'DevOps engineer with strong background in CI/CD and containerization',
      skills: [
        { name: 'Docker', level: 'Expert' },
        { name: 'Kubernetes', level: 'Advanced' },
        { name: 'Jenkins', level: 'Advanced' }
      ],
      experience: [
        {
          company: 'Infrastructure Co',
          position: 'DevOps Engineer',
          startDate: '2018-11-01',
          current: true,
          description: 'Manage deployment pipelines and cloud infrastructure'
        }
      ]
    },
    status: 'rejected',
    stage: 'technical',
    assessment: {
      matchScore: 65
    },
    createdAt: '2024-01-03T08:45:00Z',
    updatedAt: '2024-01-17T12:10:00Z'
  },
  {
    id: 'cand-7',
    personalInfo: {
      firstName: 'Diego',
      lastName: 'Castillo',
      location: {
        city: 'Huancayo',
        country: 'Peru'
      }
    },
    contact: {
      email: 'diego.castillo@email.com',
      phone: '+51 333 222 111',
      linkedin: 'https://linkedin.com/in/diegocastillo'
    },
    profile: {
      summary: 'Data scientist with expertise in machine learning and analytics',
      skills: [
        { name: 'Python', level: 'Expert' },
        { name: 'TensorFlow', level: 'Advanced' },
        { name: 'SQL', level: 'Advanced' }
      ],
      experience: [
        {
          company: 'Data Analytics Corp',
          position: 'Data Scientist',
          startDate: '2021-01-01',
          current: true,
          description: 'Build predictive models and analyze business data'
        }
      ]
    },
    status: 'new',
    stage: 'applied',
    assessment: {
      matchScore: 72
    },
    createdAt: '2024-01-20T15:30:00Z',
    updatedAt: '2024-01-20T15:30:00Z'
  },
  {
    id: 'cand-8',
    personalInfo: {
      firstName: 'Patricia',
      lastName: 'Flores',
      location: {
        city: 'Chiclayo',
        country: 'Peru'
      }
    },
    contact: {
      email: 'patricia.flores@email.com',
      phone: '+51 222 111 000',
      linkedin: 'https://linkedin.com/in/patriciaflores'
    },
    profile: {
      summary: 'Frontend developer passionate about creating beautiful user interfaces',
      skills: [
        { name: 'Angular', level: 'Advanced' },
        { name: 'CSS', level: 'Expert' },
        { name: 'SASS', level: 'Advanced' }
      ],
      experience: [
        {
          company: 'UI/UX Studio',
          position: 'Frontend Developer',
          startDate: '2020-09-01',
          current: true,
          description: 'Create responsive and accessible web interfaces'
        }
      ]
    },
    status: 'contacted',
    stage: 'screening',
    assessment: {
      matchScore: 81
    },
    createdAt: '2024-01-18T10:15:00Z',
    updatedAt: '2024-01-19T08:20:00Z'
  },
  {
    id: 'cand-9',
    personalInfo: {
      firstName: 'Roberto',
      lastName: 'Silva',
      location: {
        city: 'Tacna',
        country: 'Peru'
      }
    },
    contact: {
      email: 'roberto.silva@email.com',
      phone: '+51 111 000 999',
      linkedin: 'https://linkedin.com/in/robertosilva'
    },
    profile: {
      summary: 'QA engineer with automation testing expertise',
      skills: [
        { name: 'Selenium', level: 'Expert' },
        { name: 'Jest', level: 'Advanced' },
        { name: 'Cypress', level: 'Advanced' }
      ],
      experience: [
        {
          company: 'Quality Assurance Ltd',
          position: 'QA Engineer',
          startDate: '2019-02-01',
          current: true,
          description: 'Develop and maintain automated testing frameworks'
        }
      ]
    },
    status: 'interview',
    stage: 'cultural',
    assessment: {
      matchScore: 76
    },
    createdAt: '2024-01-14T12:00:00Z',
    updatedAt: '2024-01-21T09:45:00Z'
  },
  {
    id: 'cand-10',
    personalInfo: {
      firstName: 'Carmen',
      lastName: 'Mendoza',
      location: {
        city: 'Ayacucho',
        country: 'Peru'
      }
    },
    contact: {
      email: 'carmen.mendoza@email.com',
      phone: '+51 000 999 888',
      linkedin: 'https://linkedin.com/in/carmenmendoza'
    },
    profile: {
      summary: 'Product manager with technical background and user-focused approach',
      skills: [
        { name: 'Product Strategy', level: 'Advanced' },
        { name: 'Agile', level: 'Expert' },
        { name: 'Analytics', level: 'Intermediate' }
      ],
      experience: [
        {
          company: 'Product Innovations',
          position: 'Product Manager',
          startDate: '2020-01-01',
          current: true,
          description: 'Lead product development and strategy initiatives'
        }
      ]
    },
    status: 'new',
    stage: 'applied',
    assessment: {
      matchScore: 83
    },
    createdAt: '2024-01-22T14:20:00Z',
    updatedAt: '2024-01-22T14:20:00Z'
  },
  {
    id: 'cand-11',
    personalInfo: {
      firstName: 'Fernando',
      lastName: 'Quispe',
      location: {
        city: 'Puno',
        country: 'Peru'
      }
    },
    contact: {
      email: 'fernando.quispe@email.com',
      phone: '+51 999 777 555',
      linkedin: 'https://linkedin.com/in/fernandoquispe'
    },
    profile: {
      summary: 'Cybersecurity specialist with focus on network security and penetration testing',
      skills: [
        { name: 'Ethical Hacking', level: 'Expert' },
        { name: 'Network Security', level: 'Advanced' },
        { name: 'Linux', level: 'Advanced' }
      ],
      experience: [
        {
          company: 'SecureNet Solutions',
          position: 'Cybersecurity Analyst',
          startDate: '2019-06-01',
          current: true,
          description: 'Conduct security assessments and implement protection measures'
        }
      ]
    },
    status: 'contacted',
    stage: 'screening',
    assessment: {
      matchScore: 89
    },
    createdAt: '2024-01-16T11:30:00Z',
    updatedAt: '2024-01-23T13:15:00Z'
  },
  {
    id: 'cand-12',
    personalInfo: {
      firstName: 'Valeria',
      lastName: 'Torres',
      location: {
        city: 'Cajamarca',
        country: 'Peru'
      }
    },
    contact: {
      email: 'valeria.torres@email.com',
      phone: '+51 888 555 333',
      linkedin: 'https://linkedin.com/in/valeriatorres'
    },
    profile: {
      summary: 'UI/UX designer with strong visual design and user research skills',
      skills: [
        { name: 'Sketch', level: 'Expert' },
        { name: 'User Research', level: 'Advanced' },
        { name: 'Wireframing', level: 'Advanced' }
      ],
      experience: [
        {
          company: 'Creative Agency',
          position: 'UI/UX Designer',
          startDate: '2020-07-01',
          current: true,
          description: 'Design user interfaces and conduct user experience research'
        }
      ]
    },
    status: 'interview',
    stage: 'cultural',
    assessment: {
      matchScore: 91
    },
    createdAt: '2024-01-11T16:45:00Z',
    updatedAt: '2024-01-24T11:30:00Z'
  },
  {
    id: 'cand-13',
    personalInfo: {
      firstName: 'Andrés',
      lastName: 'Chávez',
      location: {
        city: 'Huaraz',
        country: 'Peru'
      }
    },
    contact: {
      email: 'andres.chavez@email.com',
      phone: '+51 777 444 222',
      linkedin: 'https://linkedin.com/in/andreschavez'
    },
    profile: {
      summary: 'Database administrator with expertise in PostgreSQL and MongoDB',
      skills: [
        { name: 'PostgreSQL', level: 'Expert' },
        { name: 'MongoDB', level: 'Advanced' },
        { name: 'Database Design', level: 'Advanced' }
      ],
      experience: [
        {
          company: 'Database Solutions',
          position: 'Database Administrator',
          startDate: '2018-04-01',
          current: true,
          description: 'Manage and optimize database systems for enterprise applications'
        }
      ]
    },
    status: 'new',
    stage: 'applied',
    assessment: {
      matchScore: 74
    },
    createdAt: '2024-01-19T09:20:00Z',
    updatedAt: '2024-01-19T09:20:00Z'
  },
  {
    id: 'cand-14',
    personalInfo: {
      firstName: 'Gabriela',
      lastName: 'Ramos',
      location: {
        city: 'Ica',
        country: 'Peru'
      }
    },
    contact: {
      email: 'gabriela.ramos@email.com',
      phone: '+51 666 333 111',
      linkedin: 'https://linkedin.com/in/gabrielaramos'
    },
    profile: {
      summary: 'Scrum Master and Agile coach with team leadership experience',
      skills: [
        { name: 'Scrum', level: 'Expert' },
        { name: 'Agile Coaching', level: 'Advanced' },
        { name: 'Team Leadership', level: 'Advanced' }
      ],
      experience: [
        {
          company: 'Agile Consulting',
          position: 'Scrum Master',
          startDate: '2019-10-01',
          current: true,
          description: 'Facilitate agile ceremonies and coach development teams'
        }
      ]
    },
    status: 'contacted',
    stage: 'screening',
    assessment: {
      matchScore: 79
    },
    createdAt: '2024-01-17T14:10:00Z',
    updatedAt: '2024-01-25T15:40:00Z'
  },
  {
    id: 'cand-15',
    personalInfo: {
      firstName: 'Miguel',
      lastName: 'Paredes',
      location: {
        city: 'Tumbes',
        country: 'Peru'
      }
    },
    contact: {
      email: 'miguel.paredes@email.com',
      phone: '+51 555 222 000',
      linkedin: 'https://linkedin.com/in/miguelparedes'
    },
    profile: {
      summary: 'Systems architect with experience in enterprise software design',
      skills: [
        { name: 'System Architecture', level: 'Expert' },
        { name: 'Microservices', level: 'Advanced' },
        { name: 'API Design', level: 'Advanced' }
      ],
      experience: [
        {
          company: 'Enterprise Systems',
          position: 'Systems Architect',
          startDate: '2017-03-01',
          current: true,
          description: 'Design scalable enterprise software architectures'
        }
      ]
    },
    status: 'interview',
    stage: 'technical',
    assessment: {
      matchScore: 87
    },
    createdAt: '2024-01-13T10:25:00Z',
    updatedAt: '2024-01-26T14:50:00Z'
  },
  {
    id: 'cand-16',
    personalInfo: {
      firstName: 'Isabella',
      lastName: 'Vega',
      location: {
        city: 'Moquegua',
        country: 'Peru'
      }
    },
    contact: {
      email: 'isabella.vega@email.com',
      phone: '+51 444 111 777',
      linkedin: 'https://linkedin.com/in/isabellavega'
    },
    profile: {
      summary: 'Business analyst with strong analytical and communication skills',
      skills: [
        { name: 'Business Analysis', level: 'Advanced' },
        { name: 'Requirements Gathering', level: 'Expert' },
        { name: 'Process Improvement', level: 'Advanced' }
      ],
      experience: [
        {
          company: 'Business Solutions',
          position: 'Business Analyst',
          startDate: '2020-02-01',
          current: true,
          description: 'Analyze business processes and recommend improvements'
        }
      ]
    },
    status: 'offer',
    stage: 'offer',
    assessment: {
      matchScore: 84
    },
    createdAt: '2024-01-09T13:40:00Z',
    updatedAt: '2024-01-27T16:25:00Z'
  },
  {
    id: 'cand-17',
    personalInfo: {
      firstName: 'Javier',
      lastName: 'Huamán',
      location: {
        city: 'Abancay',
        country: 'Peru'
      }
    },
    contact: {
      email: 'javier.huaman@email.com',
      phone: '+51 333 666 999',
      linkedin: 'https://linkedin.com/in/javierhuaman'
    },
    profile: {
      summary: 'Cloud engineer specializing in AWS and Azure infrastructure',
      skills: [
        { name: 'AWS', level: 'Expert' },
        { name: 'Azure', level: 'Advanced' },
        { name: 'Terraform', level: 'Advanced' }
      ],
      experience: [
        {
          company: 'Cloud Infrastructure Inc',
          position: 'Cloud Engineer',
          startDate: '2019-12-01',
          current: true,
          description: 'Design and manage cloud infrastructure solutions'
        }
      ]
    },
    status: 'rejected',
    stage: 'technical',
    assessment: {
      matchScore: 68
    },
    createdAt: '2024-01-07T11:55:00Z',
    updatedAt: '2024-01-28T10:15:00Z'
  },
  {
    id: 'cand-18',
    personalInfo: {
      firstName: 'Lucía',
      lastName: 'Espinoza',
      location: {
        city: 'Pucallpa',
        country: 'Peru'
      }
    },
    contact: {
      email: 'lucia.espinoza@email.com',
      phone: '+51 222 555 888',
      linkedin: 'https://linkedin.com/in/luciaespinoza'
    },
    profile: {
      summary: 'Technical writer with experience in API documentation and user guides',
      skills: [
        { name: 'Technical Writing', level: 'Expert' },
        { name: 'API Documentation', level: 'Advanced' },
        { name: 'Markdown', level: 'Advanced' }
      ],
      experience: [
        {
          company: 'Documentation Services',
          position: 'Technical Writer',
          startDate: '2020-11-01',
          current: true,
          description: 'Create comprehensive technical documentation for software products'
        }
      ]
    },
    status: 'hired',
    stage: 'hired',
    assessment: {
      matchScore: 93
    },
    createdAt: '2024-01-06T08:30:00Z',
    updatedAt: '2024-01-29T12:45:00Z'
  },
  {
    id: 'cand-19',
    personalInfo: {
      firstName: 'Ricardo',
      lastName: 'Delgado',
      location: {
        city: 'Chimbote',
        country: 'Peru'
      }
    },
    contact: {
      email: 'ricardo.delgado@email.com',
      phone: '+51 111 444 777',
      linkedin: 'https://linkedin.com/in/ricardodelgado'
    },
    profile: {
      summary: 'Machine learning engineer with deep learning and computer vision expertise',
      skills: [
        { name: 'Machine Learning', level: 'Expert' },
        { name: 'PyTorch', level: 'Advanced' },
        { name: 'Computer Vision', level: 'Advanced' }
      ],
      experience: [
        {
          company: 'AI Research Lab',
          position: 'ML Engineer',
          startDate: '2021-05-01',
          current: true,
          description: 'Develop machine learning models for computer vision applications'
        }
      ]
    },
    status: 'new',
    stage: 'applied',
    assessment: {
      matchScore: 86
    },
    createdAt: '2024-01-21T09:10:00Z',
    updatedAt: '2024-01-21T09:10:00Z'
  },
  {
    id: 'cand-20',
    personalInfo: {
      firstName: 'Natalia',
      lastName: 'Campos',
      location: {
        city: 'Huánuco',
        country: 'Peru'
      }
    },
    contact: {
      email: 'natalia.campos@email.com',
      phone: '+51 000 333 666',
      linkedin: 'https://linkedin.com/in/nataliacampos'
    },
    profile: {
      summary: 'Digital marketing specialist with data-driven approach and SEO expertise',
      skills: [
        { name: 'Digital Marketing', level: 'Advanced' },
        { name: 'SEO', level: 'Expert' },
        { name: 'Google Analytics', level: 'Advanced' }
      ],
      experience: [
        {
          company: 'Digital Marketing Agency',
          position: 'Digital Marketing Specialist',
          startDate: '2020-08-01',
          current: true,
          description: 'Develop and execute digital marketing campaigns'
        }
      ]
    },
    status: 'contacted',
    stage: 'screening',
    assessment: {
      matchScore: 77
    },
    createdAt: '2024-01-15T15:20:00Z',
    updatedAt: '2024-01-30T09:35:00Z'
  },
  {
    id: 'cand-21',
    personalInfo: {
      firstName: 'Sebastián',
      lastName: 'Moreno',
      location: {
        city: 'Sullana',
        country: 'Peru'
      }
    },
    contact: {
      email: 'sebastian.moreno@email.com',
      phone: '+51 777 222 444',
      linkedin: 'https://linkedin.com/in/sebastianmoreno'
    },
    profile: {
      summary: 'Blockchain developer with experience in smart contracts and DeFi',
      skills: [
        { name: 'Solidity', level: 'Expert' },
        { name: 'Ethereum', level: 'Advanced' },
        { name: 'Web3', level: 'Advanced' }
      ],
      experience: [
        {
          company: 'Blockchain Innovations',
          position: 'Blockchain Developer',
          startDate: '2021-09-01',
          current: true,
          description: 'Develop smart contracts and decentralized applications'
        }
      ]
    },
    status: 'interview',
    stage: 'technical',
    assessment: {
      matchScore: 82
    },
    createdAt: '2024-01-12T12:15:00Z',
    updatedAt: '2024-01-31T14:20:00Z'
  },
  {
    id: 'cand-22',
    personalInfo: {
      firstName: 'Camila',
      lastName: 'Jiménez',
      location: {
        city: 'Juliaca',
        country: 'Peru'
      }
    },
    contact: {
      email: 'camila.jimenez@email.com',
      phone: '+51 555 888 111',
      linkedin: 'https://linkedin.com/in/camilajimenez'
    },
    profile: {
      summary: 'Game developer with Unity and C# programming expertise',
      skills: [
        { name: 'Unity', level: 'Expert' },
        { name: 'C#', level: 'Advanced' },
        { name: 'Game Design', level: 'Advanced' }
      ],
      experience: [
        {
          company: 'Game Studio',
          position: 'Game Developer',
          startDate: '2020-03-01',
          current: true,
          description: 'Develop mobile and PC games using Unity engine'
        }
      ]
    },
    status: 'offer',
    stage: 'offer',
    assessment: {
      matchScore: 90
    },
    createdAt: '2024-01-04T16:30:00Z',
    updatedAt: '2024-02-01T11:10:00Z'
  },
  {
    id: 'cand-23',
    personalInfo: {
      firstName: 'Rodrigo',
      lastName: 'Salinas',
      location: {
        city: 'Cerro de Pasco',
        country: 'Peru'
      }
    },
    contact: {
      email: 'rodrigo.salinas@email.com',
      phone: '+51 888 111 444',
      linkedin: 'https://linkedin.com/in/rodrigosalinas'
    },
    profile: {
      summary: 'IoT developer with embedded systems and sensor integration experience',
      skills: [
        { name: 'IoT Development', level: 'Advanced' },
        { name: 'Arduino', level: 'Expert' },
        { name: 'Raspberry Pi', level: 'Advanced' }
      ],
      experience: [
        {
          company: 'IoT Solutions',
          position: 'IoT Developer',
          startDate: '2020-06-01',
          current: true,
          description: 'Develop IoT solutions for industrial automation'
        }
      ]
    },
    status: 'new',
    stage: 'applied',
    assessment: {
      matchScore: 75
    },
    createdAt: '2024-01-23T11:45:00Z',
    updatedAt: '2024-01-23T11:45:00Z'
  },
  {
    id: 'cand-24',
    personalInfo: {
      firstName: 'Alejandra',
      lastName: 'Núñez',
      location: {
        city: 'Moyobamba',
        country: 'Peru'
      }
    },
    contact: {
      email: 'alejandra.nunez@email.com',
      phone: '+51 999 444 666',
      linkedin: 'https://linkedin.com/in/alejandranunez'
    },
    profile: {
      summary: 'E-commerce specialist with experience in online retail and digital payments',
      skills: [
        { name: 'E-commerce', level: 'Advanced' },
        { name: 'Shopify', level: 'Expert' },
        { name: 'Payment Integration', level: 'Advanced' }
      ],
      experience: [
        {
          company: 'Online Retail Co',
          position: 'E-commerce Specialist',
          startDate: '2019-07-01',
          current: true,
          description: 'Manage online store operations and optimize conversion rates'
        }
      ]
    },
    status: 'hired',
    stage: 'hired',
    assessment: {
      matchScore: 88
    },
    createdAt: '2024-01-02T14:50:00Z',
    updatedAt: '2024-02-02T10:20:00Z'
  },
  {
    id: 'cand-25',
    personalInfo: {
      firstName: 'Eduardo',
      lastName: 'Rojas',
      location: {
        city: 'Tarapoto',
        country: 'Peru'
      }
    },
    contact: {
      email: 'eduardo.rojas@email.com',
      phone: '+51 666 777 222',
      linkedin: 'https://linkedin.com/in/eduardorojas'
    },
    profile: {
      summary: 'Network administrator with expertise in enterprise networking and security',
      skills: [
        { name: 'Network Administration', level: 'Expert' },
        { name: 'Cisco', level: 'Advanced' },
        { name: 'Network Security', level: 'Advanced' }
      ],
      experience: [
        {
          company: 'Network Solutions',
          position: 'Network Administrator',
          startDate: '2018-01-01',
          current: true,
          description: 'Manage enterprise network infrastructure and security'
        }
      ]
    },
    status: 'rejected',
    stage: 'screening',
    assessment: {
      matchScore: 71
    },
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-02-03T13:30:00Z'
  }
];

// Mock publications
export const mockPublications: Publication[] = [
  {
    id: 'pub-1',
    platform: 'LinkedIn',
    url: 'https://linkedin.com/jobs/view/123456',
    title: 'Senior Frontend Developer',
    description: 'Join our team as a Senior Frontend Developer...',
    status: 'Published',
    publishedAt: '2024-01-10T08:00:00Z',
    views: 245,
    applications: 12,
    engagement: {
      likes: 15,
      shares: 3,
      clicks: 89,
      comments: 2
    },
    autoRenewal: false
  },
  {
    id: 'pub-2',
    platform: 'Computrabajo',
    url: 'https://computrabajo.com.pe/trabajo/123456',
    title: 'Desarrollador Frontend Senior',
    description: 'Únete a nuestro equipo como Desarrollador Frontend Senior...',
    status: 'Published',
    publishedAt: '2024-01-12T10:00:00Z',
    views: 156,
    applications: 8,
    engagement: {
      likes: 5,
      shares: 1,
      clicks: 67,
      comments: 0
    },
    autoRenewal: true
  }
];

// Mock recruitment processes
export const mockRecruitmentProcesses: RecruitmentProcess[] = [
  {
    id: 'rec-proc-1',
    requirement: {
      id: 'req-1',
      title: 'Senior Frontend Developer',
      department: 'Technology',
      priority: 'High',
      timeframe: '1-2 months',
      experienceLevel: 'Senior',
      workType: 'Remote',
      employmentType: 'Full-time',
      salaryMin: 8000,
      salaryMax: 12000,
      salaryCurrency: 'PEN',
      skills: ['React', 'TypeScript', 'Node.js'],
      softSkills: ['Leadership', 'Communication'],
      description: 'We are looking for a Senior Frontend Developer to join our team...',
      status: 'Active',
      createdAt: '2024-01-10T08:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
      expectedStartDate: '2024-03-01'
    },
    candidates: mockCandidates,
    publications: mockPublications,
    status: 'Active',
    metrics: {
      totalCandidates: 15,
      qualifiedCandidates: 8,
      interviewsScheduled: 3,
      offersExtended: 1,
      offerAcceptanceRate: 100,
      timeToHire: 25,
      costPerHire: 2500
    },
    timeline: {
      created: '2024-01-10T08:00:00Z',
      published: '2024-01-10T08:30:00Z',
      firstCandidate: '2024-01-11T09:00:00Z',
      firstInterview: '2024-01-18T14:00:00Z'
    },
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    recruiterId: 'rec-1',
    recruiterName: 'Ana García',
    recruiterEmail: 'ana.garcia@company.com',
    positionsCount: 2
  },
  {
    id: 'rec-proc-2',
    requirement: {
      id: 'req-2',
      title: 'UX Designer',
      department: 'Design',
      priority: 'Medium',
      timeframe: '3-6 months',
      experienceLevel: 'Mid',
      workType: 'Hybrid',
      employmentType: 'Full-time',
      salaryMin: 6000,
      salaryMax: 9000,
      salaryCurrency: 'PEN',
      skills: ['Figma', 'Adobe XD', 'Prototyping'],
      softSkills: ['Creativity', 'Empathy'],
      description: 'We are seeking a talented UX Designer...',
      status: 'Active',
      createdAt: '2024-01-08T10:00:00Z',
      updatedAt: '2024-01-12T15:30:00Z',
      expectedStartDate: '2024-04-01'
    },
    candidates: [mockCandidates[1]],
    publications: [mockPublications[1]],
    status: 'Active',
    metrics: {
      totalCandidates: 8,
      qualifiedCandidates: 5,
      interviewsScheduled: 2,
      offersExtended: 0,
      offerAcceptanceRate: 0,
      timeToHire: 0,
      costPerHire: 1800
    },
    timeline: {
      created: '2024-01-08T10:00:00Z',
      published: '2024-01-12T11:00:00Z',
      firstCandidate: '2024-01-13T16:00:00Z'
    },
    createdAt: '2024-01-08T10:00:00Z',
    updatedAt: '2024-01-12T15:30:00Z',
    recruiterId: 'rec-2',
    recruiterName: 'Carlos Mendoza',
    recruiterEmail: 'carlos.mendoza@company.com',
    positionsCount: 1
  }
];

// Helper functions for generating mock data
export const generateMockCandidate = (overrides: Partial<Candidate> = {}): Candidate => {
  const baseCandidate: Candidate = {
    id: `cand-${Date.now()}`,
    personalInfo: {
      firstName: 'Nuevo',
      lastName: 'Candidato',
      location: {
        city: 'Lima',
        country: 'Peru'
      }
    },
    contact: {
      email: `candidato${Date.now()}@email.com`
    },
    status: 'new',
    stage: 'applied',
    assessment: {
      matchScore: Math.floor(Math.random() * 40) + 60 // 60-100
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  return { ...baseCandidate, ...overrides };
};

export const generateMockPublication = (overrides: Partial<Publication> = {}): Publication => {
  const basePublication: Publication = {
    id: `pub-${Date.now()}`,
    platform: 'LinkedIn',
    url: `https://linkedin.com/jobs/view/${Date.now()}`,
    title: 'Nueva Publicación',
    description: 'Descripción de la nueva publicación...',
    status: 'Draft',
    views: 0,
    applications: 0,
    engagement: {
      likes: 0,
      shares: 0,
      clicks: 0,
      comments: 0
    },
    autoRenewal: false
  };

  return { ...basePublication, ...overrides };
};