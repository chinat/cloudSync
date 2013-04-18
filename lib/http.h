#ifndef HTTP_H
#define HTTP_H

#include <QUrl>
#include <QString>
#include <QVariant>
#include <QNetworkReply>
#include <QNetworkAccessManager>


class Http : public QObject {
    Q_OBJECT
public :
    enum Action {
        GET = 1,
        POST,
        DELETE,
        PATCH
    };
    
    Http(QUrl url, QObject *parent = NULL):QObject(parent) {
        manager = new QNetworkAccessManager(parent);
        request = new QNetworkRequest(url);
        
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
    
    void setHeader(QByteArray &name, QByteArray &value) {
        request->setRawHeader(name, value);
    }
    
    QNetworkReply * gGet() {
        manager->get((*request));
    }
    
    QNetworkReply * gPost(QByteArray &data) {
        manager->post((*request), data);
    }
    
    QNetworkReply * gPatch(QByteArray &data) {
        manager->post((*request), data);
    }
    
    QNetworkReply * gDelete() {
        manager->deleteResource((*request));
    }
    
protected :
    QNetworkAccessManager * manager;
    QNetworkRequest *request;
Q_SIGNALS:
    void finished(QMap<QString, QVariant> ret);
};

#endif // HTTP_H
