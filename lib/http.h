#ifndef HTTP_H
#define HTTP_H

#include <ios>

#include <QUrl>
#include <QString>
#include <QVariant>
#include <QNetworkReply>
#include <QNetworkRequest>
#include <QNetworkAccessManager>

using Map = QMap<QByteArray, QByteArray>;

class Http : public QObject {
    Q_OBJECT
public :
    enum Action {
        GET = 1,
        POST,
        DELETE,
        PATCH
    };
    
    Http(QObject *parent = NULL):QObject(parent) {
        manager = new QNetworkAccessManager(parent);

        // trans signals
        connect(manager, &QNetworkAccessManager::finished, [](QNetworkReply *reply){
            QNetworkReply *reply;
            QMap<QString, QVariant> ret;
            // here need to convert string to json
            ret["data"] = reply->readAll();
            
            for(QByteArray name: reply->rawHeaderList() ) {
                if(!(reply->rawHeader(name).isNull() || reply->rawHeader(name).isEmpty())) {
                    ret[QString(name)] = reply->rawHeader(name);
                }
            }
            emit finished(ret);
            reply->deleteLater();
        });
        
    }
    
    ~Http(){
        delete manager;
    }
    
    void setHeader(QByteArray &name, QByteArray &value) {
        request->setRawHeader(name, value);
    }
    
    QNetworkReply * gGet(QUrl url, QMap<QByteArray, QByteArray> header) {
        QNetworkRequest request(url);
        if(!header.isEmpty()) {
            QMapIterator iterator(header);
            while(iterator.hasNext()) {
                iterator.next();
                request.setRawHeader(iterator.key(), iterator.value());
            }
        }
        manager->get(request);
    }
    
    QNetworkReply * gPost(QUrl url, QByteArray &data) {
        QNetworkRequest request(url);
        manager->post(request, data);
    }
    
    QNetworkReply * gPatch(QUrl url, QByteArray &data) {
        QNetworkRequest request(url);
        manager->post(request, data);
    }
    
    QNetworkReply * gDelete(QUrl url) {
        QNetworkRequest request(url);
        manager->deleteResource(request);
    }
    
protected :
    QNetworkAccessManager * manager;
Q_SIGNALS:
    void finished(QMap<QString, QVariant> ret);
};

#endif // HTTP_H
