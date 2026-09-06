import { collection, getDocs, limit, query } from 'firebase/firestore';
import { db } from './config';
import firebaseConfig from '../../firebase-applet-config.json';

export interface DatabaseTestResult {
  status: 'connected' | 'not_created' | 'permission_denied' | 'error' | 'testing';
  message: string;
  projectId: string;
  databaseId: string;
  docCount?: number;
  rawError?: string;
  testedAt?: string;
}

export async function testFirestoreConnection(): Promise<DatabaseTestResult> {
  const projectId = firebaseConfig.projectId;
  const databaseId = firebaseConfig.firestoreDatabaseId || '(default)';

  try {
    const q = query(collection(db, 'properties'), limit(1));
    const snap = await getDocs(q);
    return {
      status: 'connected',
      message: 'Base de données Firestore opérationnelle et connectée avec succès !',
      projectId,
      databaseId,
      docCount: snap.size,
      testedAt: new Date().toLocaleTimeString()
    };
  } catch (err: any) {
    const errorMsg = err?.message || String(err);
    const errorCode = err?.code || '';

    // Typical Firestore error when database has not yet been created in project
    if (
      errorMsg.includes('Cloud Firestore API has not been used') ||
      errorMsg.includes('has not been used in project') ||
      errorMsg.includes('disabled') ||
      errorMsg.includes('NOT_FOUND')
    ) {
      return {
        status: 'not_created',
        message: `L'instance Cloud Firestore n'a pas encore été créée ou activée dans la console Firebase pour le projet "${projectId}".`,
        projectId,
        databaseId,
        rawError: errorMsg,
        testedAt: new Date().toLocaleTimeString()
      };
    }

    if (errorCode === 'permission-denied' || errorMsg.includes('PERMISSION_DENIED')) {
      return {
        status: 'permission_denied',
        message: `Accès non autorisé ou base non initialisée sur le projet "${projectId}". Vérifiez les règles de sécurité Firestore ou l'activation du service.`,
        projectId,
        databaseId,
        rawError: errorMsg,
        testedAt: new Date().toLocaleTimeString()
      };
    }

    return {
      status: 'error',
      message: `Erreur lors du test Firestore : ${errorMsg}`,
      projectId,
      databaseId,
      rawError: errorMsg,
      testedAt: new Date().toLocaleTimeString()
    };
  }
}
